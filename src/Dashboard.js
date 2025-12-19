import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="stat-icon" style={{ color: color }}>{icon}</div>
        <div className="stat-content">
            <div className="stat-value">{value}</div>
            <div className="stat-title">{title}</div>
        </div>
    </div>
);

const ProgressBar = ({ label, value, max, color }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="progress-item">
            <div className="progress-header">
                <span>{label}</span>
                <span>{value} ({percentage}%)</span>
            </div>
            <div className="progress-track">
                <div 
                    className="progress-fill" 
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    );
};

function Dashboard() {
    const people = useSelector(state => state.people);

    // --- KPIs ---
    const totalContacts = people.length;
    const favoritesCount = people.filter(p => p.isFavorite).length;
    // Simulation "Nouveaux ce mois-ci" (on prend arbitrairement 10% du total pour la démo)
    const newThisMonth = Math.ceil(totalContacts * 0.12); 
    const companiesCount = new Set(people.map(p => p.company)).size;

    // --- Tag Distribution (Pie Chart Data) ---
    const tagsCount = {
        'Travail': people.filter(p => p.tag === 'Travail').length,
        'Famille': people.filter(p => p.tag === 'Famille').length,
        'Amis': people.filter(p => p.tag === 'Amis').length,
        'Important': people.filter(p => p.tag === 'Important').length,
        'Aucun': people.filter(p => !p.tag).length,
    };

    // --- Age Pyramid (Bar Chart Data) ---
    const ageGroups = {
        '20-30': people.filter(p => p.age >= 20 && p.age < 30).length,
        '30-40': people.filter(p => p.age >= 30 && p.age < 40).length,
        '40-50': people.filter(p => p.age >= 40 && p.age < 50).length,
        '50+': people.filter(p => p.age >= 50).length,
    };
    const maxAgeGroup = Math.max(...Object.values(ageGroups));

    // --- Recent Contacts (Last 4) ---
    // Since we append new contacts to the end or beginning depending on implementation,
    // let's assume the API returns them, but our manual adds are at the top (if unshifted) or bottom.
    // For this demo, we'll take the first 4 as "Recent".
    const recentContacts = people.slice(0, 4);

    // CSS for Pie Chart (Conic Gradient)
    const calculatePieGradient = () => {
        let currentAngle = 0;
        const total = totalContacts || 1; // Avoid division by zero
        const colors = { 'Travail': '#5856d6', 'Famille': '#ff2d55', 'Amis': '#ff9500', 'Important': '#af52de', 'Aucun': '#e5e5ea' };
        
        const segments = Object.entries(tagsCount).map(([tag, count]) => {
            const percentage = (count / total) * 100;
            const endAngle = currentAngle + (percentage * 3.6); // 3.6 deg per percent
            const segment = `${colors[tag]} ${currentAngle}deg ${endAngle}deg`;
            currentAngle = endAngle;
            return segment;
        });

        return `conic-gradient(${segments.join(', ')})`;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-row">
                <h1 className="dashboard-title">PeopleHub v2.0</h1>
                <span className="badge-pro">PRO</span>
            </div>
            
            <div className="stats-grid">
                <StatCard title="Total Contacts" value={totalContacts} icon="👥" color="#007aff" />
                <StatCard title="Nouveaux (Mois)" value={`+${newThisMonth}`} icon="📈" color="#34c759" />
                <StatCard title="Favoris" value={favoritesCount} icon="★" color="#ffcc00" />
                <StatCard title="Entreprises" value={companiesCount} icon="🏢" color="#ff3b30" />
            </div>

            <div className="dashboard-grid-2">
                {/* Tags Pie Chart */}
                <div className="dashboard-card">
                    <h3>Répartition par Tags</h3>
                    <div className="pie-chart-wrapper">
                        <div className="pie-chart" style={{ background: calculatePieGradient() }}>
                            <div className="pie-hole"></div>
                        </div>
                        <div className="pie-legend">
                            {Object.entries(tagsCount).map(([tag, count]) => (
                                count > 0 && (
                                    <div key={tag} className="legend-item">
                                        <span className="legend-dot" style={{ 
                                            backgroundColor: tag === 'Travail' ? '#5856d6' : 
                                                           tag === 'Famille' ? '#ff2d55' : 
                                                           tag === 'Amis' ? '#ff9500' : 
                                                           tag === 'Important' ? '#af52de' : '#e5e5ea' 
                                        }}></span>
                                        <span>{tag} ({count})</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Age Pyramid */}
                <div className="dashboard-card">
                    <h3>Démographie (Âge)</h3>
                    <div className="chart-container">
                        <ProgressBar label="20 - 30 ans" value={ageGroups['20-30']} max={maxAgeGroup} color="#5ac8fa" />
                        <ProgressBar label="30 - 40 ans" value={ageGroups['30-40']} max={maxAgeGroup} color="#007aff" />
                        <ProgressBar label="40 - 50 ans" value={ageGroups['40-50']} max={maxAgeGroup} color="#5856d6" />
                        <ProgressBar label="50 ans et +" value={ageGroups['50+']} max={maxAgeGroup} color="#af52de" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-row-full">
                <div className="dashboard-card">
                    <h3>Derniers Ajouts</h3>
                    <div className="recent-grid">
                        {recentContacts.map(p => (
                            <Link to={`/person/${p.id}`} key={p.id} className="recent-card-item">
                                <div className="recent-avatar-large" style={{ backgroundColor: p.avatarColor }}>
                                    {p.picture ? <img src={p.picture.medium} alt="" /> : p.name[0]}
                                </div>
                                <div className="recent-details">
                                    <div className="recent-name">{p.name}</div>
                                    <div className="recent-meta">{p.job}</div>
                                    <div className="recent-meta">{p.email}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;