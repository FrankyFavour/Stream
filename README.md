AnimeStream 

An anime discovery and personal collection platform built with React and Django.

AnimeStream is a full-stack web application designed to help anime fans discover, explore, and organise their favourite anime. It combines a React frontend with a Django REST Framework backend and a PostgreSQL database to provide an organised anime catalogue and personalised user experience.

Features

- Anime Discovery: Browse a collection of anime titles and explore popular and recently updated anime.
- Anime Catalogue: Explore anime with genre, media type, and sorting options.
- Anime Search: Search for anime titles.
- Anime Details: View information about individual anime, including descriptions, genres, studios, and other metadata.
- User Authentication: Register, log in, and securely manage user sessions.
- User Profiles: Personalise your profile with an avatar, biography, and favourite genre.
- Personal Anime Lists: Organise anime into categories such as Watching, Completed, On Hold, Dropped, and Plan to Watch.
- Favourites: Save anime to a personal favourites collection.
- Responsive Interface: A React-based interface designed for an enjoyable browsing experience.

 **Development note:** The anime watch page and video playback functionality are still under development.

Tech Stack

Frontend
- React
- Vite
- JavaScript
- CSS
- Axios
- React Router

Backend
- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT

Database
- PostgreSQL (Neon)
- SQLite (local development fallback)

Other Tools and Services
- MyAnimeList API for anime metadata
- Git and GitHub
- WhiteNoise for static file serving


##  Getting Started

Follow these instructions to run AnimeStream locally.

### Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/FrankyFavour/Stream.git
cd Stream
```

### 2. Set Up the Backend

Navigate into the Django project directory:

```bash
cd Stream
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the Django project directory, alongside `manage.py`.

Add the required configuration:

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
DATABASE_URL=
```

For local development, leaving `DATABASE_URL` empty allows the application to use SQLite.

For PostgreSQL, provide your database connection URL.

**Important:** Never commit your actual `.env` file or expose secret keys and database credentials.

### 4. Run Database Migrations

```bash
python manage.py migrate
```

### 5. Start the Django Backend

```bash
python manage.py runserver
```

The backend will be available at:

`http://127.0.0.1:8000/`

### 6. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd Stream/frontend
```

Install the frontend dependencies:

```bash
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

`http://localhost:5173/`

##  Authentication and Security

AnimeStream uses JWT-based authentication with refresh tokens stored in HttpOnly cookies.

The authentication implementation includes:

- User registration and login.
- Access token authentication.
- Secure refresh token handling.
- Protected frontend routes.
- CSRF protection for relevant cookie-based requests.

##  Database and Anime Data

AnimeStream uses Django models to manage anime information and user-related data.

The application integrates with MyAnimeList API to retrieve anime metadata, which can then be imported into the application's database.

This approach allows anime information to be managed and served through the backend.

##  Future Improvements

Some planned improvements include:

- Implementing actual anime video playback.
- Improving the anime recommendation experience.
- Expanding user interaction features.
- Adding more personalisation options.
- Improving production media storage and deployment infrastructure.

Author

Favour Udoh

GitHub: [@FrankyFavour](https://github.com/FrankyFavour)



AnimeStream is a personal full-stack development project built to explore frontend development, backend API design, database management, authentication, and deployment.

