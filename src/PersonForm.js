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
    const [magicText, setMagicText] = useState('');
    const dispatch = useDispatch();

    if (!isOpen) {
        return null;
    }

    const handleSetTag = (tag) => {
        setSelectedTag(prev => prev === tag ? null : tag);
    };

    const handleMagicPaste = (e) => {
        const text = e.target.value;
        setMagicText(text);

        // 1. Extract Email
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const emailMatch = text.match(emailRegex);
        if (emailMatch) {
            setEmail(emailMatch[0]);
        }

        // 2. Extract Name (Heuristic: First line or words before email)
        // This is basic AI. Real AI would use NLP.
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
            // Assume the first line that is NOT an email is the name
            const potentialName = lines.find(line => !line.includes('@'));
            if (potentialName) {
                // Clean up (remove "Name:", "Nom:", etc.)
                const cleanName = potentialName.replace(/^(Nom|Name|Contact)\s*:\s*/i, '').trim();
                if (cleanName.length < 30) { // Sanity check
                    setName(cleanName);
                }
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#F1948A", "#82E0AA", "#85C1E9"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newPerson = {
            id: generateUUID(),
            name,
            email,
            age: '',
            phone: '',
            job: '',
            company: '',
            address: '',
            notes: magicText, // Save the raw text in notes
            avatarColor: randomColor,
            isFavorite: false,
            tag: selectedTag,
            picture: null
        };

        dispatch(addPerson(newPerson));
        dispatch(addNotification(`${name} a été ajouté.`));
        
        // Reset form and close modal
        setName('');
        setEmail('');
        setSelectedTag(null);
        setMagicText('');
        onClose();
    };

    const handleClose = () => {
        setName('');
        setEmail('');
        setSelectedTag(null);
        setMagicText('');
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Nouveau Contact</h2>
                
                <div className="magic-paste-container">
                    <label className="magic-paste-label">✨ Magic Paste (IA)</label>
                    <textarea 
                        className="magic-paste-area" 
                        placeholder="Collez une signature mail ou une bio ici..."
                        value={magicText}
                        onChange={handleMagicPaste}
                    />
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="new-contact-name">Nom complet</label>
                        <input id="new-contact-name" value={name} onChange={(e) => setName(e.target.value)} required />
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