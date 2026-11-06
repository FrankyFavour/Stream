import { Link } from "react-router-dom";
import "./AnimeCard.css";

function AnimeCard({ anime }) {
    const mediaType = anime.media_type
        ? anime.media_type.toUpperCase().replace("_", " ")
        : null;

    return (
        <Link
            to={`/anime/${anime.id}`}
            className="anime-card-link"
        >
            <article className="anime-card">
                <div className="anime-poster">
                    <img
                        src={anime.image_url}
                        alt={anime.animeName}
                        loading="lazy"
                    />

                    <div className="anime-overlay">
                        <span className="play-button">▶</span>
                    </div>

                    {anime.score != null && (
                        <span className="anime-score">
                            ★ {Number(anime.score).toFixed(2)}
                        </span>
                    )}
                </div>

                <div className="anime-info">
                    <h3 title={anime.animeName}>
                        {anime.animeName}
                    </h3>

                    <div className="anime-metadata">
                        {anime.release_year && (
                            <span>{anime.release_year}</span>
                        )}

                        {mediaType && (
                            <span className="anime-type">
                                {mediaType}
                            </span>
                        )}
                    </div>

                    <p>
                        {anime.status} • {anime.episode || 0} Episodes
                    </p>
                </div>
            </article>
        </Link>
    );
}

export default AnimeCard;