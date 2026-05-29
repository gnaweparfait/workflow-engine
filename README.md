# WorkflowEngine — Document de présentation

## Projet académique — Développement Web 2.0

**Établissement :** École Supérieure de Technologie et de Management (ESTM)
**Niveau :** Master 1
**Année académique :** 2025 – 2026
**Professeur :** Monsieur Ibrahima Gaye

---

# 1. Introduction

Dans le cadre du module Développement Web 2.0, notre groupe a réalisé une plateforme web appelée **WorkflowEngine**. L’idée est inspirée des outils comme Trello, avec un système de tableau Kanban pour organiser des tâches.

Le but du projet était surtout de pratiquer ce qu’on a vu en cours : JavaScript événementiel, manipulation du DOM, architecture modulaire et utilisation des API du navigateur.

On a fait le choix de développer l’application en **JavaScript vanilla (sans framework)** pour bien comprendre comment fonctionne une application web de base.

Le projet montre aussi une architecture orientée événements (EDA), où tout est basé sur des événements entre les différentes parties de l’application.

---

# 2. Présentation générale de la plateforme

WorkflowEngine est une application web qui permet de gérer des tâches sous forme de colonnes (style Kanban).

Chaque utilisateur peut créer des tâches, les modifier, les déplacer ou les supprimer directement dans l’interface.

La plateforme propose plusieurs fonctionnalités :

* création et gestion de colonnes
* ajout et modification de tâches
* glisser-déposer des cartes entre colonnes
* recherche des tâches en temps réel
* sauvegarde automatique
* export et import en JSON
* historique des actions (Undo/Redo)
* thème clair et sombre

L’interface est simple et pensée pour être facile à utiliser, même sans formation.

---

# 3. Objectifs du projet

Le projet avait deux types d’objectifs.

## Objectifs pédagogiques

* comprendre les événements JavaScript
* manipuler le DOM dynamiquement
* structurer une application en modules
* utiliser les API du navigateur
* organiser un code front-end propre

## Objectifs techniques

* créer un tableau Kanban fonctionnel
* gérer un état global de l’application
* utiliser un bus d’événements (Pub/Sub)
* implémenter le drag & drop
* sauvegarder les données dans le navigateur

---

# 4. Architecture technique

L’application est basée sur une architecture orientée événements.

Les différents modules communiquent entre eux via un système d’événements (`CustomEvent`).

Les avantages de cette architecture :

* les modules sont indépendants
* le code est plus facile à maintenir
* la logique est bien séparée
* l’application est plus simple à faire évoluer

Le projet est organisé comme suit :

* **core/** : état, événements, commandes, historique
* **modules/** : board, tâches, colonnes, recherche, thèmes
* **services/** : stockage des données
* **utils/** : fonctions utiles
* **css/** : styles de l’interface

À chaque changement, un événement `stateChanged` est déclenché pour mettre à jour l’interface et sauvegarder les données.

---

# 5. Fonctionnalités principales

## Gestion des tâches

Chaque tâche contient :

* un titre
* une description
* une priorité
* une date limite
* une couleur

Les tâches sont affichées sous forme de cartes dans les colonnes.

## Gestion des colonnes

On peut ajouter, modifier ou supprimer des colonnes.

Colonnes par défaut :

* À faire
* En cours
* Terminé

## Drag & Drop

Les tâches peuvent être déplacées entre les colonnes grâce au glisser-déposer (HTML5 Drag & Drop).

## Sauvegarde

Les données sont automatiquement sauvegardées dans le navigateur avec `localStorage`.

## Export / Import

On peut exporter le tableau en JSON et le réimporter plus tard.

## Historique

Un système permet d’annuler ou de refaire des actions (Ctrl+Z / Ctrl+Y).

---

# 6. Technologies utilisées

* HTML5 pour la structure
* CSS3 pour le style
* JavaScript ES6+ pour la logique
* localStorage pour la sauvegarde
* CustomEvent pour la communication interne
* FileReader et Blob pour import/export
* Node.js pour quelques tests

Le projet est fait sans framework pour mieux comprendre le JavaScript de base.

---

# 7. Difficultés rencontrées

Pendant le projet, on a rencontré quelques difficultés :

* mise à jour dynamique du DOM
* synchronisation de l’état global
* gestion du drag & drop
* organisation du code en modules
* mise en place de l’historique Undo/Redo

Ces difficultés nous ont permis de mieux comprendre le développement front-end.

---

# 8. Conclusion

WorkflowEngine est une petite application web de gestion de tâches inspirée de Trello.

Ce projet nous a permis de pratiquer plusieurs notions importantes du développement web : événements, DOM, modularité et gestion d’état.

C’est aussi une base qui peut être améliorée plus tard avec une base de données, une connexion utilisateur ou même une version collaborative en temps réel.

---

# 9. Participants

* Woré Taokreo Gnawé Parfait — Génie Logiciel
* Diakarya Seck — Sécurité des Systèmes d'Information
* Abdoulaye Haidara — Sécurité des Systèmes d'Information
* Ousman Tahir Harane — Sécurité des Systèmes d'Information
* Bichara Bakhit Aware — Sécurité des Systèmes d'Information

---

# Liens du projet

GitHub :
[https://github.com/gnaweparfait/workflow-engine](https://github.com/gnaweparfait/workflow-engine)

Site en ligne :
[https://gnaweparfait.github.io/workflow-engine/](https://gnaweparfait.github.io/workflow-engine/)
