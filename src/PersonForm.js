import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addPerson, addNotification } from './actions';

const ALL_TAGS = ['Travail', 'Famille', 'Amis', 'Important'];

// Simple UUID generator
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function PersonForm({ isOpen, onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const dispatch = useDispatch();

    if (!isOpen) {
        return null;
    }

    const handleSetTag = (tag) => {
        setSelectedTag(prev => prev === tag ? null : tag);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#F1948A", "#82E0AA", "#85C1E9"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newPerson = {
            id: generateUUID(), // Use string UUID
            name,
            email,
            age: '',
            phone: '',
            job: '',
            company: '',
            address: '',
            notes: '',
            avatarColor: randomColor,
            isFavorite: false,
            tag: selectedTag,
            picture: null // No picture for new contacts
        };

        dispatch(addPerson(newPerson));
        dispatch(addNotification(`${name} a été ajouté.`));
        
        // Reset form and close modal
        setName('');
        setEmail('');
        setSelectedTag(null);
        onClose();
    };

    const handleClose = () => {
        setName('');
        setEmail('');
        setSelectedTag(null);
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Nouveau Contact</h2>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="new-contact-name">Nom complet</label>
                        <input id="new-contact-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-contact-email">Email</label>
                        <input id="new-contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Tag</label>
                        <div className="tag-container">
                            {ALL_TAGS.map(tag => (
                                <div 
                                    key={tag} 
                                    className={`tag-badge ${selectedTag === tag ? 'active' : ''}`}
                                    onClick={() => handleSetTag(tag)}
                                >
                                    {tag}
                                    {selectedTag === tag && <span className="tag-check">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Annuler</button>
                        <button type="submit" className="btn-save">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PersonForm;