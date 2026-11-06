import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(username.trim(), password);
            navigate("/profile", { replace: true });
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);

            setError(
                err.response?.status === 401
                    ? "Incorrect username or password."
                    : "Login failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <Link to="/" className="login-brand">
                    AnimeStream<span>.</span>
                </Link>

                <h1>Welcome back</h1>
                <p className="login-subtitle">
                    Sign in to your account.
                </p>

                {error && (
                    <p className="login-error" role="alert">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="login-username">Username</label>
                        <input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">Password</label>

                        <div className="login-password-wrap">
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        className="login-submit"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="login-register">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>

                <Link to="/" className="login-back-home">
                    ← Back to home
                </Link>
                
            </section>
        </main>
    );
}

export default Login;
