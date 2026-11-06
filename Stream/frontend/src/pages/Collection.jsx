
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AnimeCard from "../components/AnimeCard";
import "./Collection.css";

const API_URL = "http://127.0.0.1:8000/api/anime/";

const collections = {
    popular: {
        title: "Popular Anime",
        endpoint: "popular/",
        description: "Explore popular anime from the collection.",
    },
    latest: {
        title: "Latest Anime",
        endpoint: "latest/",
        description: "Discover the latest anime releases.",
    },
    recent: {
        title: "Recently Updated",
        endpoint: "recent/",
        description: "Catch up with recently updated anime.",
    },
    "most-commented": {
        title: "Most Commented",
        endpoint: "most-commented/",
        description: "Explore anime getting people talking.",
    },
};

function Collection() {
    const { type } = useParams();

    const collection = collections[type];

    const [animeList, setAnimeList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Reset pagination when switching collections
    useEffect(() => {
        setPage(1);
    }, [type]);

    useEffect(() => {
        if (!collection) {
            setLoading(false);
            setError("");
            return;
        }

        let cancelled = false;

        async function fetchCollection() {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get(
                    `${API_URL}${collection.endpoint}`,
                    {
                        params: { page },
                    }
                );

                if (cancelled) return;

                const data = response.data;

                setAnimeList(data.results);
                setTotalCount(data.count);
                setTotalPages(
                    Math.max(1, Math.ceil(data.count / 20))
                );
            } catch (error) {
                if (cancelled) return;

                console.error("Could not load collection:", error);
                setError("Something went wrong while loading anime.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchCollection();

        return () => {
            cancelled = true;
        };
    }, [collection, page]);

    if (!collection) {
        return (
            <main className="collection-page">
                <h1>Collection Not Found</h1>
                <p>The collection you're looking for doesn't exist.</p>
                <Link to="/">Return Home</Link>
            </main>
        );
    }

    return (
        <main className="collection-page">
            <header className="collection-header">
                <Link to="/" className="collection-back-link">
                    &larr; Back to Home
                </Link>

                <h1>{collection.title}</h1>
                <p>{collection.description}</p>
            </header>

            <div className="collection-results-bar">
                <p>
                    Showing{" "}
                    {totalCount === 0 ? 0 : (page - 1) * 20 + 1}
                    {"–"}
                    {Math.min(page * 20, totalCount)}
                    {" of "}
                    {totalCount} anime
                </p>
            </div>

            {loading && (
                <p className="collection-message">Loading anime...</p>
            )}

            {!loading && error && (
                <p className="collection-message collection-error">
                    {error}
                </p>
            )}

            {!loading && !error && animeList.length === 0 && (
                <p className="collection-message">
                    No anime found in this collection.
                </p>
            )}

            {!loading && !error && animeList.length > 0 && (
                <>
                    <section className="collection-grid">
                        {animeList.map((anime) => (
                            <AnimeCard
                                key={anime.id}
                                anime={anime}
                            />
                        ))}
                    </section>

                    <nav
                        className="collection-pagination"
                        aria-label="Collection pagination"
                    >
                        <button
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                            disabled={page === 1}
                        >
                            Previous
                        </button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
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

export default Collection;
