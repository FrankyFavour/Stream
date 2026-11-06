import logo from "../assets/animestream_logo_high_contrast.png";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Navbar() {
    const [searchInput, setSearchInput] = useState("");
    const [showGenres, setShowGenres] = useState(false);
    const [genres, setGenres] = useState([]);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/anime/genres/")
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error("Could not load genres:", error);
            });
    }, []);

    const handleSubGenreClick = (selectedGenre) => {
        setShowGenres(false);
        navigate(`/search?genre=${encodeURIComponent(selectedGenre)}`);
    };

    const handleSearch = () => {
        const query = searchInput.trim();

        if (!query) return;

        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleRandom = async () => {
        try{
            const response = await axios.get(`http://127.0.0.1:8000/api/anime/random/`);
            navigate(`/anime/${response.data.id}`); 
        }catch (error) {
            console.error("Logout request failed:", error);
        }
    };

    const handleProfileButton = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setShowProfileMenu((previous) => !previous);
        setShowGenres(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setShowProfileMenu(false);
            navigate("/login", { replace: true });
        }
    };

    const avatarUrl = user?.avatar
        ? user.avatar.startsWith("http")
            ? user.avatar
            : `http://127.0.0.1:8000${user.avatar}`
        : null;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link
                    to="/"
                    className="logo"
                    onClick={() => setShowProfileMenu(false)}
                >
                    <img src={logo} alt="AnimeStream" />
                </Link>

                <button
                    type="button"
                    className="nav-link genre-button"
                    onClick={() => {
                        setShowGenres((previous) => !previous);
                        setShowProfileMenu(false);
                    }}
                >
                    Genre
                </button>

                <button
                    type="button"
                    className="navbar-link random-button"
                    onClick={handleRandom}
                >
                    Random
                </button>

            </div>

            {showGenres && (
                <div className="genre-menu">
                    <h2>Genres</h2>

                    {genres.map((genre) => (
                        <button
                            type="button"
                            key={genre}
                            onClick={() => handleSubGenreClick(genre)}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            )}

            <div className="navbar-right">
                <div className="search-box">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        placeholder="In the mood for..."
                        aria-label="Search anime"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="Search"
                    >
                        🔍
                    </button>
                </div>

                <div className="navbar-account">
                    <button
                        type="button"
                        className="profile-button"
                        onClick={handleProfileButton}
                        aria-label={user ? "Open account menu" : "Log in"}
                        aria-expanded={showProfileMenu}
                    >
                        {user ? (
                            avatarUrl ? (
                                <img
                                    className="navbar-avatar"
                                    src={avatarUrl}
                                    alt=""
                                />
                            ) : (
                                <span className="navbar-avatar-fallback">
                                    {user.username?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )
                        ) : (
                            <span aria-hidden="true">👤</span>
                        )}
                    </button>

                    {showProfileMenu && user && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-user">
                                <span className="profile-dropdown-name">
                                    {user.username}
                                </span>

                                <span className="profile-dropdown-label">
                                    ANIMESTREAM MEMBER
                                </span>
                            </div>

                            <div className="profile-dropdown-divider" />

                            <Link
                                to="/profile"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <span aria-hidden="true">👤</span>
                                My Profile
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                <span aria-hidden="true">↪</span>
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
