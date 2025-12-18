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

// --- Persistance & Store ---
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('contact_app_state', serializedState);
    } catch (err) { /* Ignore */ }
};
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('contact_app_state');
        if (serializedState === null) return undefined;
        
        const loadedState = JSON.parse(serializedState);
        
        return {
            notifications: [],
            theme: 'light',
            ...loadedState
        };
    } catch (err) {
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

        const formattedPeople = data.results.map((user, index) => ({
            id: user.login.uuid,
            name: `${user.name.first} ${user.name.last}`,
            age: user.dob.age,
            email: user.email,
            // Replace hyphens with spaces for French format
            phone: user.phone.replace(/-/g, ' '),
            job: jobs[Math.floor(Math.random() * jobs.length)],
            company: "API Corp",
            address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}`,
            notes: "",
            avatarColor: colors[Math.floor(Math.random() * colors.length)],
            isFavorite: index < 2,
            tag: Math.random() > 0.5 ? availableTags[Math.floor(Math.random() * availableTags.length)] : null,
            picture: user.picture
        }));

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