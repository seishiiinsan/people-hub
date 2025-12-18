# Gestion de Personnes - Répertoire v1.0.0

Une application de gestion de contacts moderne et responsive, inspirée par l'application Contacts de macOS.

## 🚀 Fonctionnalités

### 🎨 Interface & UX
*   **Design MacOS** : Interface épurée à deux volets (Liste / Détails).
*   **Responsive** : Adaptation mobile fluide avec navigation par glissement.
*   **Mode Sombre** : Support natif du Dark Mode (détection système).
*   **Notifications** : Système de "Toasts" pour confirmer les actions (sauvegarde, suppression, etc.).

### 👥 Gestion des Contacts
*   **Données Réelles** : Initialisation avec 50 profils français via l'API RandomUser (Photos, Adresses, etc.).
*   **CRUD Complet** : Ajouter, Modifier (tous les champs), et Supprimer des contacts.
*   **Validation** : Vérification en temps réel des formats d'email et de téléphone.
*   **Persistance** : Sauvegarde automatique des données dans le `localStorage`.

### 🔍 Organisation
*   **Recherche** : Filtrage en temps réel par nom, email ou entreprise.
*   **Tri Alphabétique** : Groupement automatique des contacts par lettre (A, B, C...).
*   **Favoris** : Gestion des favoris (max 3) affichés en haut de la liste avec leurs avatars.
*   **Tags** : Système de catégorisation (Travail, Famille, Amis, Important) avec filtrage.

## 🛠 Stack Technique

*   **Frontend** : React 18
*   **State Management** : Redux (avec persistance locale)
*   **Routing** : React Router v6
*   **Styling** : CSS3 pur avec Variables CSS (Custom Properties) pour le theming.

## 📦 Installation

1.  Cloner le projet.
2.  Installer les dépendances :
    ```bash
    npm install
    ```
3.  Lancer le serveur de développement :
    ```bash
    npm start
    ```

---
*v1.0.0 - Développé avec passion.*
