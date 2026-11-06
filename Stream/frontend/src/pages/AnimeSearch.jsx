import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import AnimeCard from "../components/AnimeCard";
import "./Search.css";

function AnimeSearch() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const queryGenre = searchParams.get('genre');
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //When this component loads, or when this particular value changes, 
        // perform this side effect depending on []

        if (!query && !queryGenre) {
            setAnimeList([]);
            setLoading(false);
            return;
        }

        let url = "";
        if (query) {
            url = `http://127.0.0.1:8000/api/anime/search/?q=${query}`;
        } else if (queryGenre) {
            url = `http://127.0.0.1:8000/api/anime/genre/?genre=${queryGenre}`
        }

        if (url) {
            axios
                .get(url)
                .then((response) => {
                    setAnimeList(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                })
        };
    }, [query, queryGenre]);

    if (loading) {
        return <h2> Loading, Please wait...</h2>
    }

    return (
        <div className="search-page">
            <h1>
                {query ? `Search results for "${query}"` : `Anime in "${queryGenre}"`}
            </h1>

            {animeList.length === 0 ? (
                <p>No anime found.</p>
            ) : (
                <div className="search-results">
                    {animeList.map((anime) => (
                        <AnimeCard key={anime.id}
                            anime={anime} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AnimeSearch;