import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Watch.css";

function Watch() {
    const { slug } = useParams();

    const [anime, setAnime] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEpisode, setSelectedEpisode] = useState(1)

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:8000/api/anime/watch/${slug}/`)
            .then((response) => {
                setAnime(response.data.anime);
                setEpisodes(response.data.episode);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!anime) {
        return <h2>Anime not found.</h2>;
    }

    return (
        <div className="watch-page">

            <div className="video-container">
                <div className="video-placeholder">
                    <span>▶</span>
                    <p>Video Player coming soon</p>
                </div>
            </div>

            <div className="watch-info">
                <h1>{anime.animeName}</h1>

                <p>
                    {anime.status} • {anime.episode || 0} Episodes
                </p>

                <p>
                    Now you are Watching episode {selectedEpisode}
                </p>
            </div>

            <div className="episode-navigation">
                <button onClick={() => setSelectedEpisode(selectedEpisode - 1)}
                    disabled={selectedEpisode === 1}> ← Previous </button>

                <span> Episode {selectedEpisode} </span>

                <button onClick={() => setSelectedEpisode(selectedEpisode + 1)}
                    disabled={selectedEpisode === episodes.length}>Next → </button>
            </div>

            <div className="episode-section">
                <h2>Episodes</h2>

                <div className="episode-list">
                    {episodes.map((episode) => (
                        <button
                            key={episode}
                            className={
                                episode === selectedEpisode
                                    ? "episode-button active"
                                    : "episode-button"
                            }
                            onClick={() => setSelectedEpisode(episode)}
                        >
                            Episode {episode}
                        </button>
                    ))}
                </div>
            </div>


        </div>

    );
}

export default Watch;