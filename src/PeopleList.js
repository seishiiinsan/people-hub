import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const ALL_TAGS = ['Travail', 'Famille', 'Amis', 'Important'];

const Avatar = ({ person, className }) => {
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
        setImgError(true);
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    if (person.picture && !imgError) {
        return <img src={person.picture.thumbnail} alt={person.name} onError={handleImageError} />;
    }

    return (
        <div className={className} style={{ backgroundColor: person.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getInitials(person.name)}
        </div>
    );
};

function PeopleList({ onAddContact }) {
    const people = useSelector(state => state.people);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState(null);

    const favorites = people
        .filter(p => p.isFavorite)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 3);
    
    const filteredPeople = people
        .filter(p => {
            const matchesSearch = !p.isFavorite && (
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.company.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesTag = !activeTag || p.tag === activeTag;
            return matchesSearch && matchesTag;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const groupedPeople = filteredPeople.reduce((groups, person) => {
        const letter = person.name[0].toUpperCase();
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(person);
        return groups;
    }, {});

    return (
        <>
            <div className="sidebar-header">
                <div className="header-row">
                    <input 
                        type="search" 
                        className="search-bar" 
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="add-btn" onClick={onAddContact} aria-label="Ajouter un contact">+</button>
                </div>
                {favorites.length > 0 && (
                    <div className="favorites-bar">
                        {favorites.map(p => (
                            <NavLink key={p.id} to={`/person/${p.id}`} className={({isActive}) => "fav-avatar" + (isActive ? " active" : "")}>
                                <Avatar person={p} className="fav-avatar-initials" />
                            </NavLink>
                        ))}
                    </div>
                )}
                <div className="tag-filter-bar">
                    <button 
                        className={`tag-filter ${!activeTag ? 'active' : ''}`}
                        onClick={() => setActiveTag(null)}
                    >
                        Tous
                    </button>
                    {ALL_TAGS.map(tag => (
                        <button 
                            key={tag}
                            className={`tag-filter ${activeTag === tag ? 'active' : ''}`}
                            onClick={() => setActiveTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
            <nav className="people-list">
                {Object.keys(groupedPeople).length > 0 ? (
                    Object.keys(groupedPeople).map(letter => (
                        <div key={letter} className="group-section">
                            <div className="group-header">{letter}</div>
                            <ul>
                                {groupedPeople[letter].map(p => (
                                    <li key={p.id}>
                                        <NavLink to={`/person/${p.id}`} className={({ isActive }) => "contact-item" + (isActive ? " active" : "")}>
                                            <span className="contact-name">{p.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="empty-list-message">Aucun contact trouvé.</div>
                )}
            </nav>
        </>
    );
}

export default PeopleList;