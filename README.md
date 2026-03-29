# FanTracker 

FanTracker is a comprehensive, full-stack web application designed for die-hard football fans. It allows users to track their away days, browse match schedules, view stadium details, watch video highlights, and compete with others in a global fan ranking.

##Key Features

* **Match Center:** Browse fixtures and results. Filter matches by team or specific league rounds.
* **Stadium Check-ins ("I was there!"):** Users can check in at matches they attend to build their personal fan history.
* **Fan Profiles & Statistics:** Personalized dashboards displaying total matches attended, unique cities visited, a timeline of away days, and the user's favorite team.
* **Favorite Team Selection:** Choose your beloved club from the database to proudly display its badge on your profile.
* **Immersive Match Details:** View comprehensive match data including stadium pictures, capacity, Google Maps navigation links, and embedded YouTube video highlights for finished games.
* **Dynamic League Table:** The backend automatically calculates league standings (points, wins, losses, goal differences) locally based on stored match results, bypassing external API limits.
* **External API Integration:** Seamlessly imports teams, matches, stadiums, badges, and video links from [TheSportsDB](https://www.thesportsdb.com/).

##Tech Stack

This project is built as a monorepo containing both the backend and frontend.

### Frontend
* **React.js** (via **Vite** for blazing fast builds)
* **Tailwind CSS** (for responsive, modern, dark-mode styling)
* **React Router** (for seamless page navigation)
* **Axios** (for API communication)
* **Lucide React** (for beautiful, scalable icons)

### Backend
* **Java** (17+)
* **Spring Boot** (RESTful API architecture)
* **Spring Data JPA / Hibernate** (ORM)
* **PostgreSQL** (Relational Database)
* **Jackson** (JSON parsing)
* **Spring RestClient** (for external API calls)

##Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
* Java Development Kit (JDK) 17 or newer installed.
* Node.js and npm installed.
* PostgreSQL installed and running locally.
* PgAdmin (optional, for database management).

### Backend Setup (Spring Boot)
1. Open pgAdmin or your Postgres CLI and create a new database (e.g., `football_app`).
2. Navigate to the backend directory of the project (e.g., `src/main/resources/`) and configure your `application.properties` file:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/football_app
   spring.datasource.username=YOUR_POSTGRES_USERNAME
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
