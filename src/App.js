import React, { useEffect, useState } from 'react';
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import rootReducer from './reducers';
import PeopleList from './PeopleList';
import PersonForm from './PersonForm';
import PersonDetails from './PersonDetails';
import { removeNotification, setPeople } from './actions';
import './App.css';

// --- French Cities Coordinates ---
const FRENCH_CITIES = [
    { city: "Paris", lat: 48.8566, lon: 2.3522 },
    { city: "Marseille", lat: 43.2965, lon: 5.3698 },
    { city: "Lyon", lat: 45.7640, lon: 4.8357 },
    { city: "Toulouse", lat: 43.6047, lon: 1.4442 },
    { city: "Nice", lat: 43.7102, lon: 7.2620 },
    { city: "Nantes", lat: 43.6045, lon: 1.444 },
    { city: "Strasbourg", lat: 47.2184, lon: -1.5536 },
    { city: "Montpellier", lat: 43.6108, lon: 3.8767 },
    { city: "Bordeaux", lat: 44.8378, lon: -0.5792 },
    { city: "Lille", lat: 50.6292, lon: 3.0573 },
    { city: "Rennes", lat: 48.1173, lon: -1.6778 },
    { city: "Reims", lat: 48.5734, lon: 7.7521 },
    { city: "Le Havre", lat: 50.5178, lon: 0.1079 },
    { city: "Saint-Étienne", lat: 49.2583, lon: 4.0317 },
    { city: "Toulon", lat: 43.1242, lon: 5.928 },
];

const getRandomFrenchLocation = () => {
    return FRENCH_CITIES[Math.floor(Math.random() * FRENCH_CITIES.length)];
};

// --- Persistance & Store ---
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('contact_app_state', serializedState);
    } catch (err) { console.error("Save state failed", err); }
};

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('contact_app_state');
        if (serializedState === null) return undefined;
        
        const loadedState = JSON.parse(serializedState);
        
        // --- Data Migration Script ---
        // Force update coordinates to real French cities
        if (loadedState.people && loadedState.people.length > 0) {
            loadedState.people = loadedState.people.map(person => {
                // Check if coordinates are valid French city coordinates (simple check)
                const isValid = FRENCH_CITIES.some(c => 
                    Math.abs(c.lat - parseFloat(person.coordinates?.latitude)) < 0.01 &&
                    Math.abs(c.lon - parseFloat(person.coordinates?.longitude)) < 0.01
                );

                if (!isValid) {
                    const loc = getRandomFrenchLocation();
                    // Update address to match the city
                    const street = person.address.split(',')[0]; // Keep street part
                    return {
                        ...person,
                        address: `${street}, ${loc.city}`,
                        coordinates: { latitude: loc.lat, longitude: loc.lon }
                    };
                }
                return person;
            });
        }
        // --- End Migration ---

        return {
            notifications: [],
            theme: 'light',
            ...loadedState
        };
    } catch (err) {
        console.error("Load state failed", err);
        return undefined;
    }
};

const persistedState = loadState();
const store = createStore(rootReducer, persistedState);

store.subscribe(() => {
    saveState({ people: store.getState().people });
});

// --- API Call ---
const fetchAndSetUsers = async () => {
    // Only fetch if the user list is empty (on first load)
    if (store.getState().people && store.getState().people.length > 0) {
        return;
    }

    try {
        const response = await fetch('https://randomuser.me/api/?results=50&nat=fr');
        const data = await response.json();
        
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#F1948A", "#82E0AA", "#85C1E9"];
        const availableTags = ['Travail', 'Famille', 'Amis', 'Important'];
        const jobs = ["Développeur", "Designer", "Manager", "Commercial", "Consultant"];

        const formattedPeople = data.results.map((user, index) => {
            const loc = getRandomFrenchLocation();
            
            return {
                id: user.login.uuid,
                name: `${user.name.first} ${user.name.last}`,
                age: user.dob.age,
                email: user.email,
                phone: user.phone.replace(/-/g, ' '),
                job: jobs[Math.floor(Math.random() * jobs.length)],
                company: "API Corp",
                // Use the city from our list, but keep the street from API
                address: `${user.location.street.number} ${user.location.street.name}, ${loc.city}`,
                coordinates: { latitude: loc.lat, longitude: loc.lon },
                notes: "",
                avatarColor: colors[Math.floor(Math.random() * colors.length)],
                isFavorite: index < 2,
                tag: Math.random() > 0.5 ? availableTags[Math.floor(Math.random() * availableTags.length)] : null,
                picture: user.picture
            };
        });

        store.dispatch(setPeople(formattedPeople));
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }
};

// --- Components ---
const Notification = ({ message, id }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeNotification(id));
        }, 3000);
        return () => clearTimeout(timer);
    }, [dispatch, id]);

    return <div className="toast">{message}</div>;
};

const AppLayout = () => {
    const location = useLocation();
    const notifications = useSelector(state => state.notifications || []);
    const isDetailView = location.pathname.startsWith('/person/');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Theme management
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);
        handleChange(); // Initial check
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Fetch users on initial load
    useEffect(() => {
        fetchAndSetUsers();
    }, []);

    return (
        <>
            <div className={`app-container ${isDetailView ? 'show-detail' : ''}`}>
                <aside className="sidebar">
                    <PeopleList onAddContact={() => setIsModalOpen(true)} />
                </aside>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<div className="empty-selection">Sélectionnez un contact</div>} />
                        <Route path="/person/:id" element={<PersonDetails />} />
                    </Routes>
                </main>
            </div>
            <PersonForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <div className="notification-container">
                {notifications.map(n => <Notification key={n.id} {...n} />)}
            </div>
        </>
    );
};

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppLayout />
            </Router>
        </Provider>
    );
}

export default App;