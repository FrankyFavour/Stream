import { useEffect, useState } from "react";
import api from "../services/api";

function MyAnimeList() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMyAnimeList = async () => {
            try {
                const response = await api.get("my-list/");
                setAnimeList(response.data);
            } catch (err) {
                console.error(
                    "Could not load your anime list:",
                    err.response?.data || err.message
                );
                setError("Could not load your anime list. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyAnimeList();
    }, []);

    if (loading) {
        return <main className="my-list-page">Loading your anime list...</main>;
    }

    if (error) {
        return <main className="my-list-page">{error}</main>;
    }

    return (
        <main className="my-list-page">
            <h1>My Anime List</h1>
            <p>Keep track of the anime you're watching.</p>

            {animeList.length === 0 ? (
                <p>
                    Your list is empty for now. Explore the catalogue and
                    add your first anime!
                </p>
            ) : (
                <div className="my-list-grid">
                    {animeList.map((entry) => (
                        <article key={entry.id} className="my-list-item">
                            {entry.anime_image && (
                                <img
                                    src={entry.anime_image}
                                    alt={entry.anime_title}
                                />
                            )}

                            <h2>{entry.anime_title}</h2>
                            <p>Status: {entry.status.replaceAll("_", " ")}</p>
                            <p>
                                Episodes watched: {entry.episodes_watched}
                            </p>

                            {entry.is_favorite && <p>❤️ Favourite</p>}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default MyAnimeList;
