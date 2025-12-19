import React, { useState, useEffect } from 'react';
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
    const [phone, setPhone] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [magicText, setMagicText] = useState('');
    const [detectedFields, setDetectedFields] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isOpen) {
            // Reset fields when modal closes
            setName('');
            setEmail('');
            setPhone('');
            setSelectedTag(null);
            setMagicText('');
            setDetectedFields([]);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSetTag = (tag) => {
        setSelectedTag(prev => prev === tag ? null : tag);
    };

    const handleMagicPaste = (e) => {
        const text = e.target.value;
        setMagicText(text);
        
        const newDetected = [];

        // 1. Extract Email
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const emailMatch = text.match(emailRegex);
        if (emailMatch) {
            setEmail(emailMatch[0]);
            newDetected.push('email');
        }

        // 2. Extract Phone (French formats: 06 12 34 56 78, 06.12.34.56.78, +33 6...)
        const phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/;
        const phoneMatch = text.match(phoneRegex);
        if (phoneMatch) {
            // Normalize phone number (remove dots, keep spaces if nice, or just digits)
            setPhone(phoneMatch[0]);
            newDetected.push('phone');
        }

        // 3. Extract Name (Heuristic: First line or words before email)
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
            const potentialNameLine = lines.find(line => !line.includes('@') && !line.match(phoneRegex));
            if (potentialNameLine) {
                // Clean up common prefixes
                let cleanName = potentialNameLine
                    .replace(/^(Nom|Name|Contact|M\.|Mme|Dr|Pr)\s*[:.]?\s*/i, '')
                    .trim();
                
                // Remove emojis if any
                cleanName = cleanName.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();

                if (cleanName.length > 2 && cleanName.length < 40) {
                    setName(cleanName);
                    newDetected.push('name');
                }
            }
        }
        
        setDetectedFields(newDetected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return; // Email is optional if we just want to add a name/phone
        
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#F1948A", "#82E0AA", "#85C1E9"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newPerson = {
            id: generateUUID(),
            name,
            email,
            phone,
            age: '',
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
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Nouveau Contact</h2>
                
                <div className="magic-paste-container">
                    <div className="magic-header">
                        <span className="magic-icon">✨</span>
                        <label className="magic-paste-label">Magic Paste</label>
                        {detectedFields.length > 0 && (
                            <span className="magic-badge">
                                {detectedFields.length} infos détectées !
                            </span>
                        )}
                    </div>
                    <textarea 
                        className="magic-paste-area" 
                        placeholder="Collez une signature ici (Nom, Email, Tél)..."
                        value={magicText}
                        onChange={handleMagicPaste}
                    />
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className={`form-group ${detectedFields.includes('name') ? 'field-detected' : ''}`}>
                        <label htmlFor="new-contact-name">Nom complet</label>
                        <input id="new-contact-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className={`form-group ${detectedFields.includes('email') ? 'field-detected' : ''}`}>
                        <label htmlFor="new-contact-email">Email</label>
                        <input id="new-contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className={`form-group ${detectedFields.includes('phone') ? 'field-detected' : ''}`}>
                        <label htmlFor="new-contact-phone">Téléphone</label>
                        <input id="new-contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                        <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn-save">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PersonForm;