import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import authApi from "../services/auth";
import api from "../services/api";
import "./Profile.css";

const API_ORIGIN = "http://localhost:8000";

function getImageUrl(image) {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

function formatStatus(status = "") {
    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status = "") {
    return status.toLowerCase().replaceAll("_", "-");
}

function Profile() {
    const { user, setUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState("");
    const [favoriteGenre, setFavoriteGenre] = useState("");
    const [hotTake, setHotTake] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [animeList, setAnimeList] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [animeListLoading, setAnimeListLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(true);

    const [listError, setListError] = useState("");
    const [favoritesError, setFavoritesError] = useState("");

    const [activeFilter, setActiveFilter] = useState("all");

    // Load profile information when the authenticated user changes.
    useEffect(() => {
        setBio(user?.bio || "");
        setFavoriteGenre(user?.favorite_genre || "");
        setHotTake(user?.hot_take || "");
    }, [user]);

    // Load the user's anime list and independent favourites.
    useEffect(() => {
        let cancelled = false;

        async function loadAnimeData() {
            if (!user) {
                setAnimeList([]);
                setFavorites([]);
                setAnimeListLoading(false);
                setFavoritesLoading(false);
                return;
            }

            setAnimeListLoading(true);
            setFavoritesLoading(true);
            setListError("");
            setFavoritesError("");

            const [listResult, favoritesResult] = await Promise.allSettled([
                api.get("my-list/"),
                api.get("favorites/"),
            ]);

            if (cancelled) return;

            if (listResult.status === "fulfilled") {
                const data = listResult.value.data;
                setAnimeList(Array.isArray(data) ? data : data.results || []);
            } else {
                setListError("Could not load your anime list.");
                setAnimeList([]);
            }

            if (favoritesResult.status === "fulfilled") {
                const data = favoritesResult.value.data;
                setFavorites(Array.isArray(data) ? data : data.results || []);
            } else {
                setFavoritesError("Could not load your favourite anime.");
                setFavorites([]);
            }

            setAnimeListLoading(false);
            setFavoritesLoading(false);
        }

        loadAnimeData();

        return () => {
            cancelled = true;
        };
    }, [user]);

    // Save bio, favourite genre and hot take.
    async function handleSaveProfile(event) {
        event.preventDefault();

        setIsSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await authApi.patch("userprofile/", {
                bio,
                favorite_genre: favoriteGenre,
                hot_take: hotTake,
            });

            const updatedProfile = response.data;

            setUser((previousUser) => ({
                ...previousUser,
                ...updatedProfile,
                bio: updatedProfile.bio ?? bio,
                favorite_genre:
                    updatedProfile.favorite_genre ?? favoriteGenre,
                hot_take: updatedProfile.hot_take ?? hotTake,
            }));

            setIsEditing(false);
            setMessage("Your profile has been updated!");
        } catch (err) {
            console.error("Profile update failed:", err.response?.data || err);
            setError("Could not update your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    // Upload a new avatar.
    async function handleAvatarChange(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        setMessage("");
        setError("");

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Your avatar must be smaller than 5 MB.");
            event.target.value = "";
            return;
        }

        setSelectedAvatar(file);

        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await authApi.patch("userprofile/", formData);

            setUser((previousUser) => ({
                ...previousUser,
                ...response.data,
            }));

            setMessage("Avatar updated successfully!");
            setSelectedAvatar(null);
            setAvatarPreview("");
            URL.revokeObjectURL(previewUrl);
        } catch (err) {
            console.error("Avatar upload failed:", err.response?.data || err);

            setError("Avatar upload failed. Please try again.");
            setSelectedAvatar(null);
            setAvatarPreview("");
            URL.revokeObjectURL(previewUrl);
        } finally {
            event.target.value = "";
        }
    }

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            setError("Could not log out. Please try again.");
        }
    }

    const filteredAnime = activeFilter === "all"
        ? animeList
        : animeList.filter((entry) => entry.status === activeFilter);

    const totalEpisodesWatched = animeList.reduce(
        (total, entry) => total + (Number(entry.episodes_watched) || 0),
        0
    );

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Recently Joined";

    const avatarUrl = avatarPreview ||
        getImageUrl(user?.avatar) ||
        "";

    return (
        <div className="profile-page">

            {/* =============== PROFILE HERO =============== */}
            <section className="profile-header">

                <div className="profile-avatar-container">
                    {avatarUrl ? (
                        <img
                            className="profile-avatar"
                            src={avatarUrl}
                            alt={`${user?.username || "User"}'s avatar`}
                        />
                    ) : (
                        <div
                            className="profile-avatar"
                            style={{
                                display: "grid",
                                placeItems: "center",
                                background: "#19121d",
                                color: "#f12d4b",
                                fontSize: "4rem",
                                fontWeight: "bold",
                            }}
                        >
                            {(user?.username || "A")
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}

                    <label
                        className="avatar-upload-control"
                        title="Change avatar"
                        style={{
                            position: "absolute",
                            right: 0,
                            bottom: 10,
                            display: "grid",
                            placeItems: "center",
                            width: 42,
                            height: 42,
                            border: "1px solid #45404b",
                            borderRadius: "50%",
                            background: "#171923",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        ✎
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            hidden
                        />
                    </label>
                </div>

                <div className="profile-info">
                    <h1>{user?.username || "Anime Fan"}</h1>

                    <span className="profile-username">
                        @{user?.username || "animefan"}
                    </span>

                    <p className="profile-bio">
                        {user?.bio ||
                            "An anime fan on a journey through amazing stories. ❤️"}
                    </p>

                    <div className="profile-meta">
                        <span>
                            ✉ {user?.email || "No email available"}
                        </span>

                        <span>▦ Member since {memberSince}</span>

                        <span>
                            ♧ Favourite Genre:{" "}
                            <strong>
                                {user?.favorite_genre || "Not set"}
                            </strong>
                        </span>
                    </div>

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="profile-button"
                            onClick={() => {
                                setIsEditing((previous) => !previous);
                                setMessage("");
                                setError("");
                            }}
                        >
                            ✎ {isEditing ? "Cancel Editing" : "Edit Profile"}
                        </button>
                    </div>

                    <div
                        className="profile-stats"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            maxWidth: 710,
                            marginTop: 24,
                            padding: "18px 0",
                            border: "1px solid #292e3c",
                            borderRadius: 13,
                            background: "rgba(12, 14, 21, 0.75)",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <strong
                                style={{
                                    display: "block",
                                    color: "#f5f5fa",
                                    fontSize: "1.35rem",
                                }}
                            >
                                {animeList.length}
                            </strong>
                            <span style={{ color: "#a4adc2", fontSize: ".85rem" }}>
                                In My List
                            </span>
                        </div>

                        <div
                            style={{
                                textAlign: "center",
                                borderLeft: "1px solid #292e3c",
                                borderRight: "1px solid #292e3c",
                            }}
                        >
                            <strong
                                style={{
                                    display: "block",
                                    color: "#f5f5fa",
                                    fontSize: "1.35rem",
                                }}
                            >
                                {totalEpisodesWatched}
                            </strong>
                            <span style={{ color: "#a4adc2", fontSize: ".85rem" }}>
                                Episodes Watched
                            </span>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <strong
                                style={{
                                    display: "block",
                                    color: "#f5f5fa",
                                    fontSize: "1.35rem",
                                }}
                            >
                                {favorites.length}
                            </strong>
                            <span style={{ color: "#a4adc2", fontSize: ".85rem" }}>
                                ❤️ Favourites
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =============== STATUS MESSAGES =============== */}
            <div style={{ padding: "0 clamp(20px, 4.5vw, 70px)" }}>
                {message && (
                    <p className="profile-message" role="status">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="profile-error" role="alert">
                        {error}
                    </p>
                )}
            </div>

            {/* =============== DASHBOARD CONTENT =============== */}
            <div className="profile-dashboard">

                <main className="profile-main">

                    {/* =============== EDIT PROFILE FORM =============== */}
                    {isEditing && (
                        <section className="profile-section">
                            <h2>Edit Your Profile</h2>

                            <form
                                className="profile-edit-form"
                                onSubmit={handleSaveProfile}
                            >
                                <div>
                                    <label htmlFor="profile-bio">
                                        About You
                                    </label>

                                    <textarea
                                        id="profile-bio"
                                        value={bio}
                                        onChange={(event) =>
                                            setBio(event.target.value)
                                        }
                                        placeholder="Tell other anime fans about yourself..."
                                        maxLength={500}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="favorite-genre">
                                        Favourite Genre
                                    </label>

                                    <input
                                        id="favorite-genre"
                                        type="text"
                                        value={favoriteGenre}
                                        onChange={(event) =>
                                            setFavoriteGenre(event.target.value)
                                        }
                                        placeholder="e.g. Action, Fantasy, Romance"
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="hot-take">
                                        Your Anime Hot Take
                                    </label>

                                    <textarea
                                        id="hot-take"
                                        value={hotTake}
                                        onChange={(event) =>
                                            setHotTake(event.target.value)
                                        }
                                        placeholder="Share an unpopular anime opinion..."
                                        maxLength={500}
                                    />
                                </div>

                                <div className="profile-form-actions">
                                    <button
                                        type="submit"
                                        className="save-profile-button"
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        className="profile-button"
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* =============== MY ANIME LIST =============== */}
                    <section className="profile-anime-section">
                        <h2>My Anime List</h2>

                        <div className="profile-list-filters">
                            {[
                                { label: "All", value: "all" },
                                { label: "Watching", value: "watching" },
                                { label: "On Hold", value: "on_hold" },
                                {
                                    label: "Plan to Watch",
                                    value: "plan_to_watch",
                                },
                                { label: "Dropped", value: "dropped" },
                                { label: "Completed", value: "completed" },
                            ].map((filter) => (
                                <button
                                    type="button"
                                    key={filter.value}
                                    className={
                                        activeFilter === filter.value
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveFilter(filter.value)
                                    }
                                >
                                    {filter.label}
                                    {filter.value !== "all" &&
                                        ` (${animeList.filter(
                                            (entry) =>
                                                entry.status === filter.value
                                        ).length})`}
                                </button>
                            ))}
                        </div>

                        {animeListLoading ? (
                            <p className="profile-anime-empty">
                                Loading your anime list...
                            </p>
                        ) : listError ? (
                            <p className="profile-error">{listError}</p>
                        ) : filteredAnime.length === 0 ? (
                            <div className="profile-anime-empty">
                                <p>
                                    {activeFilter === "all"
                                        ? "Your anime list is empty for now."
                                        : `You have no anime marked "${formatStatus(
                                              activeFilter
                                          )}" yet.`}
                                </p>

                                <Link
                                    to="/catalogue"
                                    className="profile-favorites-link"
                                >
                                    Explore anime →
                                </Link>
                            </div>
                        ) : (
                            <div className="profile-anime-grid">
                                {filteredAnime.map((entry) => {
                                    const episodesWatched =
                                        Number(entry.episodes_watched) || 0;

                                    const totalEpisodes =
                                        Number(entry.episode) ||
                                        Number(entry.anime_episode) ||
                                        0;

                                    const progress = totalEpisodes > 0
                                        ? Math.min(
                                              100,
                                              Math.round(
                                                  (episodesWatched /
                                                      totalEpisodes) *
                                                      100
                                              )
                                          )
                                        : 0;

                                    const image = getImageUrl(
                                        entry.anime_image
                                    );

                                    return (
                                        <article
                                            className="profile-anime-item"
                                            key={entry.id}
                                        >
                                            <Link
                                                to={`/anime/${entry.anime}`}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={entry.anime_title}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            aspectRatio: "3 / 3.5",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            background: "#171923",
                                                            color: "#a4adc2",
                                                        }}
                                                    >
                                                        No image
                                                    </div>
                                                )}

                                                <h3>
                                                    {entry.anime_title ||
                                                        "Untitled Anime"}
                                                </h3>
                                            </Link>

                                            <span
                                                className={`anime-status status-${getStatusClass(
                                                    entry.status
                                                )}`}
                                            >
                                                ◉ {formatStatus(entry.status)}
                                            </span>

                                            {/* <p>
                                                {episodesWatched} episodes watched
                                            </p> */}

                                            {/* <div
                                                className="anime-progress"
                                                aria-label={`${progress}% watched`}
                                            >
                                                <span
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div> */}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* =============== FAVOURITE ANIME =============== */}
                    <section className="profile-anime-section">
                        <h2>
                            <span className="profile-favorite-heart">♥</span>{" "}
                            Favourite Anime
                        </h2>

                        <p className="profile-anime-subtitle">
                            The anime you love most.
                        </p>

                        {favoritesLoading ? (
                            <p className="profile-anime-empty">
                                Loading your favourites...
                            </p>
                        ) : favoritesError ? (
                            <p className="profile-error">{favoritesError}</p>
                        ) : favorites.length === 0 ? (
                            <div className="profile-anime-empty">
                                <p>You haven't added any favourites yet.</p>

                                <Link
                                    to="/catalogue"
                                    className="profile-favorites-link"
                                >
                                    Find your next favourite →
                                </Link>
                            </div>
                        ) : (
                            <div className="profile-anime-grid">
                                {favorites.map((entry) => {
                                    const image = getImageUrl(
                                        entry.anime_image
                                    );

                                    return (
                                        <article
                                            className="profile-anime-item"
                                            key={entry.id}
                                        >
                                            <Link
                                                to={`/anime/${entry.anime}`}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={entry.anime_title}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            aspectRatio: "3 / 3.5",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            background: "#171923",
                                                            color: "#a4adc2",
                                                        }}
                                                    >
                                                        No image
                                                    </div>
                                                )}

                                                <h3>
                                                    {entry.anime_title ||
                                                        "Untitled Anime"}
                                                </h3>
                                            </Link>

                                            <p>
                                                <span className="profile-favorite-heart">
                                                    ♥
                                                </span>{" "}
                                                Added to favourites
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>

                {/* =============== RIGHT SIDEBAR =============== */}
                <aside className="profile-sidebar">

                    {/* Quick Info */}
                    <section className="profile-card">
                        <h2>Quick Info</h2>

                        <div className="profile-quick-info">
                            <div>
                                <span>♙ Username</span>
                                <strong>{user?.username || "—"}</strong>
                            </div>

                            <div>
                                <span>✉ Email</span>
                                <strong>{user?.email || "—"}</strong>
                            </div>

                            <div>
                                <span>♡ Favourite Genre</span>
                                <strong>
                                    {user?.favorite_genre || "Not set"}
                                </strong>
                            </div>

                        </div>
                    </section>

                    {/* Manage Account */}
                    <section className="profile-card">
                        <h2>Manage Account</h2>

                        <div className="profile-manage-account">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(true);
                                    setMessage("");
                                    setError("");
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }}
                            >
                                ✎ Edit Profile
                            </button>

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    width: "100%",
                                    minHeight: 42,
                                    padding: "10px 14px",
                                    border: "1px solid #424859",
                                    borderRadius: 9,
                                    background: "transparent",
                                    color: "#e6e9f2",
                                    cursor: "pointer",
                                    fontSize: ".88rem",
                                }}
                            >
                                ▧ Change Avatar

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    hidden
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                ⇥ Logout
                            </button>
                        </div>
                    </section>

                    {/* Anime Hot Take */}
                    <section className="profile-quote-card">
                        <p>
                            <h3>What's your HOT TAKE?</h3>
                            {user?.hot_take ||
                                "Good anime doesn't just entertain you, it stays with you."}
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default Profile;