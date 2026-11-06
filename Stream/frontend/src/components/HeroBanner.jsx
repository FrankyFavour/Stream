import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HeroBanner.css";

function HeroBanner({ animeList }) {
    const [currentAnime, setCurrentAnime] = useState(0);

    useEffect(() => {
        if (animeList.length === 0) return;

        const timer = setInterval(() => {
            setCurrentAnime((previous) =>
                (previous + 1) % animeList.length
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [animeList]);

    if (animeList.length === 0) {
        return null;
    }

    const anime = animeList[currentAnime];

    return (
        <section className="hero-banner">
            <img
                className="hero-background"
                src={anime.image_url}
                alt={anime.animeName}
            />

            <div className="hero-overlay"></div>

            <div className="hero-content">
                <span className="hero-label">FEATURED ANIME</span>

                <h1>{anime.animeName}</h1>

                <div className="hero-meta">
                    <span>⭐ {anime.score || "N/A"}</span>
                    <span>{anime.status}</span>
                    <span>{anime.episode || "?"} Episodes</span>
                </div>

                <p>
                    {anime.synopsis || "No description available."}
                </p>

                <div className="hero-buttons">
                    <Link
                            to={`/watch/${anime.slug}`}
                            className="watch-now-button"
                        >
                            ▶ Watch Now
                    </Link>

                   <Link
                            to={`/anime/${anime.id}`}
                            className="watch-now-button"
                        >
                        More Info
                    </Link> 
                </div>
            </div>

            <div className="hero-dots">
                {animeList.map((anime, index) => (
                    <span
                        key={anime.id}
                        className={
                            index === currentAnime
                                ? "dot active"
                                : "dot"
                        }
                    ></span>
                ))}
            </div>
        </section>
    );
}

export default HeroBanner;