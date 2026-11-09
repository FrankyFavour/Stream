import { useEffect, useState } from "react";
import api from "../services/api";
import "./Home.css";
import HeroBanner from "../components/HeroBanner";
import AnimeSection from "../components/AnimeSection";

function Home() {
    const [heroAnime, setHeroAnime] = useState([]);
    const [popularAnime, setPopularAnime] = useState([]);
    const [latestAnime, setLatestAnime] = useState([]);
    const [recentAnime, setRecentAnime] = useState([]);
    const [commentedAnime, setCommentedAnime] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("hero/"),
            api.get("popular/"),
            api.get("latest/"),
            api.get("recent/"),
            api.get("most-commented/"),
        ])
        then((responses) => {
                setHeroAnime(responses[0].data);
                setPopularAnime(responses[1].data.results.slice(0, 10));
                setLatestAnime(responses[2].data.results.slice(0, 10));
                setRecentAnime(responses[3].data.results.slice(0, 10));
                setCommentedAnime(responses[4].data.results.slice(0, 10));

                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="home">
            <HeroBanner animeList={heroAnime} />

            <AnimeSection
                title="Popular Anime"
                animeList={popularAnime}
                viewAllLink="/collection/popular"
            />

            <AnimeSection
                title="Latest Anime"
                animeList={latestAnime}
                viewAllLink="/collection/latest"
            />

            <AnimeSection
                title="Recently Updated"
                animeList={recentAnime}
                viewAllLink="/collection/recent"
            />

            <AnimeSection
                title="Most Commented"
                animeList={commentedAnime}
                viewAllLink="/collection/most-commented"
            />
        </div>
    );
}

export default Home;