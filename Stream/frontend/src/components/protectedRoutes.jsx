import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    console.log("ProtectedRoute check:", { user, loading });

    if (loading) {
        return <h2>Loading, please wait...</h2>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
