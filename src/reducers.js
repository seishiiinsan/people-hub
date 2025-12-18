const initialState = {
    people: [], // Will be populated by API call
    notifications: [],
    theme: 'light'
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PEOPLE':
            return { ...state, people: action.payload };
        case 'ADD_PERSON':
            return { ...state, people: [action.payload, ...state.people] };
        case 'DELETE_PERSON':
            return { ...state, people: state.people.filter(p => p.id !== action.payload) };
        case 'UPDATE_PERSON':
            return {
                ...state,
                people: state.people.map(p =>
                    p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
                )
            };
        case 'TOGGLE_FAVORITE':
            return {
                ...state,
                people: state.people.map(p =>
                    p.id === action.payload ? { ...p, isFavorite: !p.isFavorite } : p
                )
            };
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_NOTIFICATION':
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        default:
            return state;
    }
};

export default rootReducer;