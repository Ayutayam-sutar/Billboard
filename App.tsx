import React, { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import * as authService from './services/authService';

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import InspectPage from './pages/InspectPage';
import ReportPage from './pages/ReportPage';
import Layout from './components/Layout';
import HeatmapArea from './pages/HeatmapArea';

const App = (): React.ReactNode => {
    const [user, setUser] = useState<User | null>(authService.getCurrentUser());
    const [route, setRoute] = useState<string>(window.location.hash || (user ? '#/dashboard' : '#/login'));

    const navigate = useCallback((path: string) => {
        window.location.hash = path;
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Set initial route
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // --- THIS IS THE FINAL, CORRECTED LOGIC ---
    
    // This function now directly accepts the user object from LoginPage.
    const handleLogin = (loggedInUser: User) => {
        // It sets the user state with the data it received.
        setUser(loggedInUser);
        // And now it can safely navigate to the dashboard.
        navigate('#/dashboard');
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate('#/login');
    };

    const renderPage = () => {
        if (!user) {
            return <LoginPage onLogin={handleLogin} />;
        }

        if (route.startsWith('#/report/')) {
            const reportId = route.split('/')[2];
            return <ReportPage reportId={reportId} navigate={navigate} />;
        }

        switch (route.toLowerCase()) {
            case '#/dashboard':
                return <DashboardPage navigate={navigate} />;
            case '#/inspect':
                return <InspectPage user={user} navigate={navigate} />;
            case '#/profile':
                return <ProfilePage user={user} onLogout={handleLogout} />;
            case '#/map':
                return <HeatmapArea user={user} onClose={() => navigate('#/dashboard')} />;
            default:
                if (window.location.hash !== '#/dashboard') {
                    navigate('#/dashboard');
                }
                return <DashboardPage navigate={navigate} />;
        }
    };
    
    // The main return logic is simplified and correct.
    return (
        user ? (
            <Layout user={user} navigate={navigate} onLogout={handleLogout}>
                {renderPage()}
            </Layout>
        ) : (
            <LoginPage onLogin={handleLogin} />
        )
    );
};

export default App;