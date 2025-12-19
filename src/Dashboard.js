import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon }) => (
    <div className="stat-card-v2">
        <div className="stat-icon-v2">{icon}</div>
        <div className="stat-content">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    </div>
);

function Dashboard() {
    const people = useSelector(state => state.people);

    // --- KPIs ---
    const totalContacts = people.length;
    const favoritesCount = people.filter(p => p.isFavorite).length;
    const averageAge = totalContacts > 0 
        ? Math.round(people.reduce((acc, p) => acc + p.age, 0) / totalContacts) 
        : 0;

    // --- Birthday Calculation ---
    const today = new Date();
    const todayDayOfYear = (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 0)) / 86400000;

    const upcomingBirthdays = people
        .map(p => {
            if (!p.birthDate) return null;
            const birthDate = new Date(p.birthDate);
            const birthDayOfYear = (Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()) - Date.UTC(birthDate.getFullYear(), 0, 0)) / 86400000;
            let diff = birthDayOfYear - todayDayOfYear;
            if (diff < 0) diff += 365;
            return { ...p, daysUntilBirthday: diff };
        })
        .filter(Boolean)
        .filter(p => p.daysUntilBirthday <= 30)
        .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
        .slice(0, 5); // Limit to 5

    // --- Tag Distribution ---
    const tagsCount = {
        'Travail': people.filter(p => p.tag === 'Travail').length,
        'Famille': people.filter(p => p.tag === 'Famille').length,
        'Amis': people.filter(p => p.tag === 'Amis').length,
        'Important': people.filter(p => p.tag === 'Important').length,
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-row">
                <h1 className="dashboard-title">PeopleHub</h1>
            </div>
            
            <div className="stats-grid-v2">
                <StatCard title="Total Contacts" value={totalContacts} icon="👥" />
                <StatCard title="Favoris" value={favoritesCount} icon="★" />
                <StatCard title="Âge Moyen" value={`${averageAge} ans`} icon="🎂" />
            </div>

            <div className="dashboard-grid-2">
                {/* Birthday Calendar */}
                <div className="dashboard-card-v2">
                    <h3>Anniversaires à venir</h3>
                    <div className="birthday-list">
                        {upcomingBirthdays.length > 0 ? (
                            upcomingBirthdays.map(p => (
                                <Link to={`/person/${p.id}`} key={p.id} className="birthday-item">
                                    <div className="birthday-avatar" style={{ backgroundColor: p.avatarColor }}>
                                        {p.picture ? <img src={p.picture.thumbnail} alt="" /> : p.name[0]}
                                    </div>
                                    <div className="birthday-info">
                                        <div className="birthday-name">{p.name}</div>
                                        <div className="birthday-date">
                                            {new Date(p.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                        </div>
                                    </div>
                                    <div className="birthday-countdown">
                                        {p.daysUntilBirthday === 0 ? 'Aujourd\'hui !' : `dans ${p.daysUntilBirthday} j`}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-list-message">Aucun anniversaire dans les 30 prochains jours.</div>
                        )}
                    </div>
                </div>

                {/* Tags Distribution */}
                <div className="dashboard-card-v2">
                    <h3>Répartition par Tags</h3>
                    <div className="tag-grid">
                        {Object.entries(tagsCount).map(([tag, count]) => (
                            <div key={tag} className="tag-stat-item">
                                <span className="tag-stat-name">{tag}</span>
                                <span className="tag-stat-value">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;