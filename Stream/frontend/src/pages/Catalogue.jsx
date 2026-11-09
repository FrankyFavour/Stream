import { useEffect, useState } from "react";
import axios from "axios";
import { ANIME_API_URL } from "../services/config";
import AnimeCard from "../components/AnimeCard";
import "./catalogue.css";

function Catalogue() {
    const [animeList, setAnimeList] = useState([]);
    const [genres, setGenres] = useState([]);

    const [genre, setGenre] = useState("");
    const [mediaType, setMediaType] = useState("");
    const [sort, setSort] = useState("title");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch available genres once
    useEffect(() => {
        axios
            .get(`${ANIME_API_URL}genres/`)
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error("Could not load genres:", error);
            });
    }, []);

    // Fetch catalogue whenever filters, sorting, or page changes
    useEffect(() => {
        setLoading(true);
        setError("");

        axios
            .get(ANIME_API_URL, {
                params: {
                    genre,
                    media_type: mediaType,
                    sort,
                    page,
                },
            })
            .then((response) => {
                setAnimeList(response.data.results);
                setTotalCount(response.data.count);

                const pages = Math.ceil(response.data.count / 20);
                setTotalPages(pages);
            })
            .catch((error) => {
                console.error("Could not load catalogue:", error);
                setError("Something went wrong while loading anime.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [genre, mediaType, sort, page]);

    // Reset to page 1 whenever a filter or sorting option changes
    function handleGenreChange(event) {
        setGenre(event.target.value);
        setPage(1);
    }

    function handleMediaTypeChange(event) {
        setMediaType(event.target.value);
        setPage(1);
    }

    function handleSortChange(event) {
        setSort(event.target.value);
        setPage(1);
    }

    function clearFilters() {
        setGenre("");
        setMediaType("");
        setSort("title");
        setPage(1);
    }

    return (
        <main className="catalogue-page">
            <header className="catalogue-header">
                <h1>Anime Catalogue</h1>
                <p>Explore the collection and find your next anime.</p>
            </header>

            <section className="catalogue-controls">
                <label>
                    Genre
                    <select value={genre} onChange={handleGenreChange}>
                        <option value="">All Genres</option>

                        {genres.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Type
                    <select
                        value={mediaType}
                        onChange={handleMediaTypeChange}
                    >
                        <option value="">All Types</option>
                        <option value="tv">TV</option>
                        <option value="movie">Movie</option>
                        <option value="ova">OVA</option>
                        <option value="ona">ONA</option>
                        <option value="special">Special</option>
                    </select>
                </label>

                <label>
                    Sort By
                    <select value={sort} onChange={handleSortChange}>
                        <option value="title">Title (A–Z)</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="score">Highest Score</option>
                    </select>
                </label>
            </section>

<div className="catalogue-results-bar">
    <p>
        Showing{" "}
        {totalCount === 0
            ? 0
            : (page - 1) * 20 + 1}
        {"–"}
        {Math.min(page * 20, totalCount)}
        {" of "}
        {totalCount} anime
    </p>

    <button onClick={clearFilters}>
        Clear Filters
    </button>
</div>

            {loading && <p className="catalogue-message">Loading anime...</p>}

            {!loading && error && (
                <p className="catalogue-message catalogue-error">{error}</p>
            )}

            {!loading && !error && animeList.length === 0 && (
                <p className="catalogue-message">
                    No anime found. Try changing your filters.
                </p>
            )}

            {!loading && !error && animeList.length > 0 && (
                <>
                    <section className="catalogue-grid">
                        {animeList.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </section>

                    <nav className="catalogue-pagination">
                        <button
                            onClick={() => setPage((current) => current - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((current) => current + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </nav>
                </>
            )}
        </main>
    );
}

export default Catalogue;