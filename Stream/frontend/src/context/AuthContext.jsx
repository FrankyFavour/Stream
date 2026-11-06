
import { createContext, useState, useEffect } from "react";
import authApi, { setAccessToken } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore the login session when the app starts or refreshes.
    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const response = await authApi.post("token/refresh/", {});

                setAccessToken(response.data.access);

                const userResponse = await authApi.get("me/");

                if (isMounted) {
                    setUser(userResponse.data);
                }
            } catch (error) {
                setAccessToken(null);

                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    // Log in and load the user's profile.
    const login = async (username, password) => {
        const response = await authApi.post("login/", {
            username,
            password,
        });

        const accessToken = response.data.access;

        setAccessToken(accessToken);

        try {
            const userResponse = await authApi.get("me/");
            setUser(userResponse.data);
        } catch (error) {
            setAccessToken(null);
            setUser(null);
            throw error;
        }
    };

    // Log out on the backend and clear the local session.
    const logout = async () => {
        try {
            await authApi.post("logout/", {});
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, setUser, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
