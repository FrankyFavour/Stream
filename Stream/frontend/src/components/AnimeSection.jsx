import AnimeCard from "./AnimeCard";
import "./AnimeSection.css";
import { Link } from "react-router-dom";

/* Since AnimeCard.jsx already works, AnimeSection will simply take a title and an anime list,
then use AnimeCard to display them. */
function AnimeSection({ title, animeList, viewAllLink }) {
    return (
        <section className="anime-section">
            <div className="section-header">
                <h2>{title}</h2>
                <Link to={viewAllLink} className="view-all-link">
                View All
                </Link>
            </div>

            <div className="anime-row">
                {animeList.map((anime) => (
                    <AnimeCard
                        key={anime.id}
                        anime={anime}
                    />
                ))}
            </div>
        </section>
    );
}

export default AnimeSection;