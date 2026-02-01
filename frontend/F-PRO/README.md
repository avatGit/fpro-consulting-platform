# F-PRO CONSULTING - Plateforme de Services Numériques

## 📋 Description

Plateforme web B2B moderne pour F-PRO CONSULTING permettant aux entreprises et administrations de :
- Commander des consommables informatiques
- Réserver des services technologiques
- Solliciter des prestations de développement
- Gérer la maintenance de leurs équipements

## 🚀 Technologies Utilisées

### Frontend
- **React 18** - Framework JavaScript moderne
- **React Router 6** - Navigation côté client
- **Vite** - Build tool ultra-rapide
- **CSS Custom Properties** - Design system moderne

### Design
- **Police** : Inter (Google Fonts)
- **Couleurs** : Palette professionnelle bleu/vert
- **Animations** : Transitions fluides et micro-interactions
- **Responsive** : Mobile-first design

## 📁 Structure du Projet

```
F-PRO/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Barre de navigation
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── HomePage.jsx        # Page d'accueil
│   │   ├── HomePage.css
│   │   ├── RegisterPage.jsx    # Inscription entreprise
│   │   ├── RegisterPage.css
│   │   ├── LoginPage.jsx       # Connexion
│   │   └── LoginPage.css
│   ├── App.jsx                 # Composant principal
│   ├── main.jsx                # Point d'entrée
│   └── index.css               # Design system global
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Fonctionnalités Implémentées

### ✅ Page d'Accueil
- Hero section avec gradient moderne
- Animations d'icônes flottantes
- Grille de services avec cartes interactives
- Design responsive

### ✅ Page d'Inscription
- Formulaire complet avec validation
- Champs : Nom entreprise, Email, Téléphone, Mot de passe
- Confirmation de mot de passe
- Messages d'erreur en temps réel
- Redirection vers login après inscription

### ✅ Page de Connexion
- Authentification email/mot de passe
- Option "Se souvenir de moi"
- Lien "Mot de passe oublié"
- Bouton de connexion Google
- Validation de formulaire

## 🛠️ Installation et Lancement

### Prérequis
- Node.js 18+ installé
- npm ou yarn

### Installation

```bash
# Naviguer vers le dossier du projet
cd /home/oem/Desktop/F-PRO

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Commandes Disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Créer le build de production
npm run preview  # Prévisualiser le build de production
```

## 🎯 Navigation

- **/** - Page d'accueil
- **/register** - Inscription entreprise
- **/login** - Connexion

## 🎨 Design System

### Couleurs Principales
- **Bleu Principal** : `#1e3a8a` (Primary Blue)
- **Vert Accent** : `#059669` (Accent Green)
- **Gris** : Palette complète de `gray-50` à `gray-900`

### Typographie
- **Police** : Inter (Google Fonts)
- **Tailles** : De `0.75rem` (xs) à `3rem` (5xl)

### Espacements
- **xs** : 0.25rem
- **sm** : 0.5rem
- **md** : 1rem
- **lg** : 1.5rem
- **xl** : 2rem
- **2xl** : 3rem
- **3xl** : 4rem

## 🔐 Validation des Formulaires

### Inscription
- Nom entreprise : Requis
- Email : Format valide requis
- Téléphone : Minimum 10 chiffres
- Mot de passe : Minimum 6 caractères
- Confirmation : Doit correspondre au mot de passe

### Connexion
- Email : Format valide requis
- Mot de passe : Requis

## 📱 Responsive Design

L'application est entièrement responsive avec des breakpoints à :
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

## 🎭 Animations

- **Fade In** : Apparition progressive des éléments
- **Slide In** : Entrée latérale des sections
- **Float** : Icônes flottantes dans le hero
- **Bounce** : Animation des icônes de services
- **Hover Effects** : Transformations au survol

## 🚧 Prochaines Étapes

- [ ] Tableau de bord client
- [ ] Catalogue de produits
- [ ] Système de panier
- [ ] Gestion des commandes
- [ ] Module de maintenance
- [ ] Intégration backend
- [ ] Authentification JWT
- [ ] Tests unitaires

## 👥 Équipe

Projet développé pour F-PRO CONSULTING

## 📄 Licence

© 2024 F-PRO CONSULTING. Tous droits réservés.
