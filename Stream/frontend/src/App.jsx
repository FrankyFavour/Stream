import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import AnimeSearch from "./pages/AnimeSearch";
import Catalogue from "./pages/Catalogue";
import Login from "./pages/Login";
import Profile from "./pages/profile";
import ProtectedRoute from "./components/protectedRoutes";
import Register from "./pages/Register";
import MyAnimeList from "./pages/MyAnimeList";
import Collection from "./pages/Collection";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/anime/:id" element={<AnimeDetail />} />
                <Route path="/watch/:slug" element={<Watch />} />
                <Route path="/search" element={<AnimeSearch />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute>} />
                <Route path="/my-list" element={ <ProtectedRoute> <MyAnimeList /> </ProtectedRoute> }/>
                <Route path="/collection/:type" element={<Collection />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
