import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../services/auth";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setErrors({});
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setErrors({
                confirmPassword: ["Passwords do not match."],
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.post("register/", formData);

            setMessage("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            const responseData = error.response?.data;

            if (responseData && typeof responseData === "object") {
                setErrors(responseData);
            } else {
                setMessage(
                    "Registration failed. Please check your connection and try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="register-page">
            <section className="register-card">
                <h1>Join AnimeStream</h1>

                <p>Create your account and start your anime journey.</p>

                {message && (
                    <p role="status" className="register-message">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />
                    {errors.username && (
                        <p className="register-error">
                            {errors.username.join(" ")}
                        </p>
                    )}

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />
                    {errors.email && (
                        <p className="register-error">
                            {errors.email.join(" ")}
                        </p>
                    )}

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />
                    {errors.password && (
                        <p className="register-error">
                            {errors.password.join(" ")}
                        </p>
                    )}

                    <label htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />
                    {errors.confirmPassword && (
                        <p className="register-error">
                            {errors.confirmPassword.join(" ")}
                        </p>
                    )}

                    {errors.non_field_errors && (
                        <p className="register-error">
                            {errors.non_field_errors.join(" ")}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="register-login-link">
                    Already have an account?{" "}
                    <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
