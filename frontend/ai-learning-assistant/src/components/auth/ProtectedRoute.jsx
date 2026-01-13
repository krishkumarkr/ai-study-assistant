import React from 'react'

const ProtectedRoute = () => {

    isAuthenticated = true
    isLoading = false

    if(loading) {
        return <div>Loading...</div>;
    }
    
    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ): (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;
