export const ADD_PERSON = 'ADD_PERSON';
export const DELETE_PERSON = 'DELETE_PERSON';
export const UPDATE_PERSON = 'UPDATE_PERSON';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
export const SET_PEOPLE = 'SET_PEOPLE';

export const addPerson = (person) => ({ type: ADD_PERSON, payload: person });
export const deletePerson = (id) => ({ type: DELETE_PERSON, payload: id });
export const updatePerson = (id, updates) => ({ type: UPDATE_PERSON, payload: { id, updates } });
export const toggleFavorite = (id) => ({ type: TOGGLE_FAVORITE, payload: id });
export const setPeople = (people) => ({ type: SET_PEOPLE, payload: people });

// Notification helper
export const addNotification = (message, type = 'info') => ({
    type: ADD_NOTIFICATION,
    payload: { id: Date.now(), message, type }
});
export const removeNotification = (id) => ({ type: REMOVE_NOTIFICATION, payload: id });
