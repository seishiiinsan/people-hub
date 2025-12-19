import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { deletePerson, updatePerson, toggleFavorite, addNotification } from './actions';

// --- Validation Functions ---
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/.test(phone) || phone === '';

function EditableField({ label, value, field, personId, type = 'input', validate }) {
    const dispatch = useDispatch();
    const [currentValue, setCurrentValue] = useState(value);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        setCurrentValue(value);
        if (validate) setIsValid(validate(value));
    }, [value, validate]);

    const handleUpdate = useCallback(() => {
        if (validate && !validate(currentValue)) {
            setIsValid(false);
            dispatch(addNotification('Format invalide', 'error'));
            return;
        }
        setIsValid(true);
        if (currentValue !== value) {
            dispatch(updatePerson(personId, { [field]: currentValue }));
            dispatch(addNotification('Contact sauvegardé'));
        }
    }, [dispatch, currentValue, value, field, personId, validate]);

    const commonProps = {
        id: `${field}-${personId}`,
        value: currentValue,
        onChange: (e) => setCurrentValue(e.target.value),
        onBlur: handleUpdate,
        className: `${type === 'textarea' ? 'info-value-textarea' : 'info-value-input'} ${!isValid ? 'invalid' : ''}`
    };

    return (
        <div className={`info-row ${type === 'textarea' ? 'info-row-textarea' : ''}`}>
            <label htmlFor={commonProps.id} className="info-label">{label}</label>
            {type === 'textarea' ? (
                <textarea {...commonProps} rows="4" />
            ) : type === 'date' ? (
                <input {...commonProps} type="date" />
            ) : (
                <input {...commonProps} />
            )}
        </div>
    );
}

const ALL_TAGS = ['Travail', 'Famille', 'Amis', 'Important'];

function PersonDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const person = useSelector(state => state.people.find(p => p.id === id));
    const favoriteCount = useSelector(state => state.people.filter(p => p.isFavorite).length);

    if (!person) { return null; }

    const handleDelete = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${person.name} ?`)) {
            dispatch(deletePerson(person.id));
            dispatch(addNotification(`${person.name} a été supprimé`));
            navigate('/');
        }
    };

    const handleToggleFavorite = () => {
        if (!person.isFavorite && favoriteCount >= 3) {
            dispatch(addNotification('Nombre maximum de favoris atteint (3)', 'error'));
            return;
        }
        dispatch(toggleFavorite(person.id));
        dispatch(addNotification(person.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'));
    };

    const handleSetTag = (tag) => {
        const newTag = person.tag === tag ? null : tag;
        dispatch(updatePerson(person.id, { tag: newTag }));
        dispatch(addNotification('Tag mis à jour'));
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Calculate Bounding Box for the map (small area around the point)
    const lat = parseFloat(person.coordinates?.latitude || 0);
    const lon = parseFloat(person.coordinates?.longitude || 0);
    const delta = 0.005; // Zoom level
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

    // Format date for input type="date" (YYYY-MM-DD)
    const formattedBirthDate = person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '';

    return (
        <div className="contact-card">
            <Link to="/" className="back-link-mobile">← Retour</Link>
            <div className="contact-header">
                {person.picture ? (
                    <img src={person.picture.large} alt={person.name} className="avatar-placeholder" />
                ) : (
                    <div className="avatar-placeholder" style={{ backgroundColor: person.avatarColor }}>
                        {getInitials(person.name)}
                    </div>
                )}
                <input 
                    className="contact-name-large-input" 
                    value={person.name}
                    onChange={(e) => dispatch(updatePerson(person.id, { name: e.target.value }))}
                    onBlur={() => dispatch(addNotification('Contact sauvegardé'))}
                />
                <button className="favorite-btn" onClick={handleToggleFavorite}>
                    {person.isFavorite ? <span className="star-filled">★</span> : <span className="star-outline">☆</span>}
                </button>
            </div>

            <div className="contact-info-section">
                <h3 className="section-title">Tag</h3>
                <div className="tag-container">
                    {ALL_TAGS.map(tag => {
                        const isActive = person.tag === tag;
                        return (
                            <div 
                                key={tag} 
                                className={`tag-badge ${isActive ? 'active' : ''}`}
                                onClick={() => handleSetTag(tag)}
                            >
                                {tag}
                                {isActive && <span className="tag-check">✓</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {person.coordinates && (
                <div className="contact-info-section">
                    <h3 className="section-title">Localisation</h3>
                    <div className="map-container">
                        <iframe
                            title="contact-map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="contact-info-section">
                <h3 className="section-title">Informations Personnelles</h3>
                <EditableField label="email" value={person.email} field="email" personId={person.id} validate={validateEmail} />
                <EditableField label="téléphone" value={person.phone} field="phone" personId={person.id} validate={validatePhone} />
                <EditableField label="anniversaire" value={formattedBirthDate} field="birthDate" personId={person.id} type="date" />
                <EditableField label="adresse" value={person.address} field="address" personId={person.id} />
            </div>
            
            <div className="contact-info-section">
                <h3 className="section-title">Travail</h3>
                <EditableField label="poste" value={person.job} field="job" personId={person.id} />
                <EditableField label="entreprise" value={person.company} field="company" personId={person.id} />
            </div>

            <div className="contact-info-section">
                <h3 className="section-title">Notes</h3>
                <EditableField label="notes" value={person.notes} field="notes" personId={person.id} type="textarea" />
            </div>

            <div className="action-bar">
                <button className="btn-delete" onClick={handleDelete}>
                    Supprimer le contact
                </button>
            </div>
        </div>
    );
}

export default PersonDetails;