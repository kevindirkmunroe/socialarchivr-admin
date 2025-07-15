import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('authToken'); // Check for token

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
export default ProtectedRoute;
