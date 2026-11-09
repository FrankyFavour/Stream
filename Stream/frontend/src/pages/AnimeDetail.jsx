import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import "./AnimeDetail.css";

function AnimeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Favourite state
    const [favoriteEntryId, setFavoriteEntryId] = useState(null);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState("");

    // My Anime List state
    const [myListEntryId, setMyListEntryId] = useState(null);
    const [myListStatus, setMyListStatus] = useState("plan_to_watch");
    const [selectedStatus, setSelectedStatus] = useState("plan_to_watch");
    const [myListLoading, setMyListLoading] = useState(false);
    const [myListError, setMyListError] = useState("");
    const [myListMessage, setMyListMessage] = useState("");

    // Fetch anime details
    useEffect(() => {
        setLoading(true);
        setError("");
        setAnime(null);

        axios
            .get(`${id}/`)
            .then((response) => {
                setAnime(response.data);
            })
            .catch((error) => {
                console.error("Could not load anime details:", error);
                setError("We couldn't load this anime. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    // Check whether this anime is already a favourite
    useEffect(() => {
        let cancelled = false;

        setFavoriteEntryId(null);
        setFavoriteError("");

        if (!user || !id) {
            return;
        }

        api.get("favorites/")
            .then((response) => {
                const favorites = response.data.results ?? response.data;

                const existingFavorite = favorites.find(
                    (entry) => Number(entry.anime) === Number(id)
                );

                if (!cancelled) {
                    setFavoriteEntryId(existingFavorite?.id ?? null);
                }
            })
            .catch((error) => {
                console.error(
                    "Could not load favourites:",
                    error.response?.data || error.message
                );
            });

        return () => {
            cancelled = true;
        };
    }, [id, user]);

    // Check whether this anime is already on My Anime List
    useEffect(() => {
        let cancelled = false;

        setMyListEntryId(null);
        setMyListStatus("plan_to_watch");
        setSelectedStatus("plan_to_watch");
        setMyListError("");
        setMyListMessage("");

        if (!user || !id) {
            return;
        }

        api.get("my-list/")
            .then((response) => {
                const entries = response.data.results ?? response.data;

                const existingEntry = entries.find(
                    (entry) => Number(entry.anime) === Number(id)
                );

                if (!cancelled && existingEntry) {
                    setMyListEntryId(existingEntry.id);
                    setMyListStatus(existingEntry.status);
                    setSelectedStatus(existingEntry.status);
                }
            })
            .catch((error) => {
                console.error(
                    "Could not load My Anime List:",
                    error.response?.data || error.message
                );

                if (!cancelled) {
                    setMyListError(
                        "We couldn't check your anime list. Please try again."
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id, user]);

    // Add or remove a favourite
    const handleFavoriteClick = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (favoriteLoading) {
            return;
        }

        setFavoriteLoading(true);
        setFavoriteError("");

        try {
            if (favoriteEntryId !== null) {
                await api.delete(`favorites/${favoriteEntryId}/`);
                setFavoriteEntryId(null);
            } else {
                const response = await api.post("favorites/", {
                    anime: Number(id),
                });

                setFavoriteEntryId(response.data.id);
            }
        } catch (error) {
            console.error(
                "Could not update favourite:",
                error.response?.data || error.message
            );

            setFavoriteError(
                "We couldn't update your favourites. Please try again."
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Add or remove this anime from My Anime List
    const handleMyListClick = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (myListLoading) {
            return;
        }

        setMyListLoading(true);
        setMyListError("");
        setMyListMessage("");

        try {
            if (myListEntryId !== null) {
                await api.delete(`my-list/${myListEntryId}/`);

                setMyListEntryId(null);
                setMyListStatus("plan_to_watch");
                setSelectedStatus("plan_to_watch");
                setMyListMessage("Removed from My Anime List.");
            } else {
                const response = await api.post("my-list/", {
                    anime: Number(id),
                    status: selectedStatus,
                });

                setMyListEntryId(response.data.id);
                setMyListStatus(response.data.status);
                setSelectedStatus(response.data.status);
                setMyListMessage("Added to My Anime List!");
            }
        } catch (error) {
            console.error(
                "Could not update My Anime List:",
                error.response?.data || error.message
            );

            setMyListError(
                "We couldn't update your anime list. Please try again."
            );
        } finally {
            setMyListLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="anime-detail-state">
                <p>Loading anime details...</p>
            </main>
        );
    }

    if (error || !anime) {
        return (
            <main className="anime-detail-state">
                <h2>Anime not found</h2>
                <p>
                    {error ||
                        "This anime may have been removed or the link is invalid."}
                </p>
                <Link to="/catalogue" className="back-to-catalogue">
                    Browse Catalogue
                </Link>
            </main>
        );
    }

    const score =
        anime.score != null ? Number(anime.score).toFixed(2) : "N/A";

    const mediaType = anime.media_type
        ? anime.media_type.replaceAll("_", " ").toUpperCase()
        : "Unknown";

    const genres = anime.genre
        ? anime.genre.split(",").map((genre) => genre.trim()).filter(Boolean)
        : [];

    const statusLabels = {
        watching: "Watching",
        on_hold: "On Hold",
        plan_to_watch: "Plan to Watch",
        dropped: "Dropped",
        completed: "Completed",
    };

    return (
        <main className="anime-detail">
            <div className="anime-detail-content">
                <div className="anime-detail-poster">
                    <img
                        src={anime.image_url}
                        alt={`${anime.animeName} poster`}
                    />

                    {anime.score != null && (
                        <div className="detail-score">
                            <span>★</span>
                            {score}
                            <small>MAL Score</small>
                        </div>
                    )}
                </div>

                <section className="anime-detail-info">
                    <Link to="/catalogue" className="detail-back-link">
                        ← Back to Catalogue
                    </Link>

                    <p className="detail-eyebrow">ANIME DETAILS</p>

                    <h1>{anime.animeName}</h1>

                    {anime.title_japanese && (
                        <p className="detail-japanese-title">
                            {anime.title_japanese}
                        </p>
                    )}

                    <div className="anime-detail-meta">
                        <span>{mediaType}</span>
                        {anime.release_year && (
                            <span>{anime.release_year}</span>
                        )}
                        <span>{anime.status || "Status unknown"}</span>
                        <span>{anime.episode ?? "?"} Episodes</span>
                    </div>

                    <div className="detail-section">
                        <h2>Synopsis</h2>
                        <p className="anime-detail-description">
                            {anime.synopsis || "No description available."}
                        </p>
                    </div>

                    <div className="detail-section">
                        <h2>Information</h2>

                        <dl className="anime-detail-facts">
                            <div>
                                <dt>Genres</dt>
                                <dd>
                                    {genres.length > 0 ? (
                                        <div className="detail-genre-list">
                                            {genres.map((genre) => (
                                                <span key={genre}>
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        "Not available"
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>Studio</dt>
                                <dd>{anime.studio || "Unknown"}</dd>
                            </div>

                            <div>
                                <dt>Release Year</dt>
                                <dd>{anime.release_year || "Unknown"}</dd>
                            </div>

                            <div>
                                <dt>Episodes</dt>
                                <dd>{anime.episode ?? "Unknown"}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* My Anime List controls */}
                    <div className="my-list-controls">
                        {myListEntryId === null && (
                            <div className="my-list-status-picker">
                                <label htmlFor="my-list-status">
                                    Add with status
                                </label>

                                <select
                                    id="my-list-status"
                                    value={selectedStatus}
                                    onChange={(event) =>
                                        setSelectedStatus(event.target.value)
                                    }
                                    disabled={myListLoading}
                                >
                                    <option value="plan_to_watch">
                                        Plan to Watch
                                    </option>
                                    <option value="watching">
                                        Watching
                                    </option>
                                    <option value="completed">
                                        Completed
                                    </option>
                                    <option value="on_hold">
                                        On Hold
                                    </option>
                                    <option value="dropped">
                                        Dropped
                                    </option>
                                </select>
                            </div>
                        )}

                        {myListEntryId !== null && (
                            <p className="my-list-current-status">
                                <strong>My List:</strong>{" "}
                                {statusLabels[myListStatus] || myListStatus}
                            </p>
                        )}

                        <button
                            type="button"
                            className={`my-list-button ${
                                myListEntryId !== null ? "is-in-list" : ""
                            }`}
                            onClick={handleMyListClick}
                            disabled={myListLoading}
                            aria-pressed={myListEntryId !== null}
                        >
                            {myListLoading
                                ? "Updating..."
                                : myListEntryId !== null
                                  ? "− Remove from My List"
                                  : "+ Add to My List"}
                        </button>

                        {myListMessage && (
                            <p role="status" className="my-list-message">
                                {myListMessage}
                            </p>
                        )}

                        {myListError && (
                            <p role="alert" className="my-list-error">
                                {myListError}
                            </p>
                        )}
                    </div>

                    {/* Favourite controls */}
                    <button
                        type="button"
                        className={`favorite-button ${
                            favoriteEntryId !== null ? "is-favorite" : ""
                        }`}
                        onClick={handleFavoriteClick}
                        disabled={favoriteLoading}
                        aria-pressed={favoriteEntryId !== null}
                    >
                        {favoriteLoading
                            ? "Updating..."
                            : favoriteEntryId !== null
                              ? "♥ Remove from Favourites"
                              : "♡ Add to Favourites"}
                    </button>

                    {favoriteError && (
                        <p role="alert" className="favorite-error">
                            {favoriteError}
                        </p>
                    )}

                    {anime.slug ? (
                        <Link
                            to={`/watch/${anime.slug}`}
                            className="watch-now-button"
                        >
                            ▶ Watch Now
                        </Link>
                    ) : (
                        <p className="watch-unavailable">
                            Watch page is not available for this anime yet.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}

export default AnimeDetails;