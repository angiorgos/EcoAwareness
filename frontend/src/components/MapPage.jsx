import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Header from './Header.jsx';
import MapArea from './MapArea.jsx';
import Drawer from './Drawer.jsx';
import PreferencesModal from './PreferencesModal.jsx';
import { fetchBestTime, fetchSnapshot, checkAuth } from '../services/api';

const PREFERENCES_STORAGE_KEY = 'eco-awareness:preferences';

const EMPTY_STATE = {
    profile: [],
    activities: [],
    customProfile: [],
    customActivities: [],
};

const loadStoredPreferences = () => {
    try {
        const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.labels || !parsed?.state) return null;
        return parsed;
    } catch {
        return null;
    }
};

export default function MapPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const freshLogin = location.state?.freshLogin;

    // UI State - drawer open by default on desktop, closed on mobile
    const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auth status: 'loading' | 'authed' | 'guest'. Used to gate map clicks behind login.
    const [authStatus, setAuthStatus] = useState('loading');

    // Preferences flow — hydrated from localStorage so picks survive reloads while the
    // session is alive (cleared on logout / expired session in the auth effect below).
    // Lazy initializer so localStorage is read once, not on every render.
    const [stored] = useState(() => loadStoredPreferences());
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(!stored || freshLogin);
    const [userPreferences, setUserPreferences] = useState(
        stored?.labels ?? { profile: [], activities: [] }
    );
    const [preferencesState, setPreferencesState] = useState(stored?.state ?? EMPTY_STATE);

    useEffect(() => {
        let cancelled = false;
        checkAuth().then((user) => {
            if (cancelled) return;
            if (user) {
                setAuthStatus('authed');
            } else {
                // Guest = either logged out or session expired. Wipe any cached preferences
                // so the next signed-in user starts fresh.
                try { localStorage.removeItem(PREFERENCES_STORAGE_KEY); } catch {}
                setUserPreferences({ profile: [], activities: [] });
                setPreferencesState(EMPTY_STATE);
                setIsPreferencesModalOpen(true);
                setAuthStatus('guest');
            }
        });
        return () => { cancelled = true; };
    }, []);

    // Location & Data State (progressive loading: snapshot fast, full AI/forecast slow)
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [snapshotData, setSnapshotData] = useState(null);  // fast: ~1s
    const [apiData, setApiData] = useState(null);            // slow: ~3-4s (includes AI + forecast)
    const [isAiLoading, setIsAiLoading] = useState(false);   // true όσο περιμένουμε το /best-time

    // View toggle ("now" = AnalysisPanel | "forecast" = ForecastTimeline).
    const [viewMode, setViewMode] = useState('now');

    const fetchAnalysis = async (latlng, preferences) => {
        setIsLoading(true);
        setIsAiLoading(true);
        setError(null);
        setSnapshotData(null);
        setApiData(null);

        // Παράλληλες κλήσεις. Δεν περιμένουμε το αργό για να δείξουμε τα cards.
        fetchSnapshot(latlng.lat, latlng.lng)
            .then((data) => setSnapshotData(data))
            .catch((err) => {
                console.error('Snapshot error:', err);
                // Δεν θέτουμε top-level error εδώ — το /best-time μπορεί ακόμα να δουλέψει
            })
            .finally(() => setIsLoading(false));

        fetchBestTime(latlng.lat, latlng.lng, preferences)
            .then((data) => setApiData(data))
            .catch((err) => {
                console.error('BestTime error:', err);
                setError(err.message || 'Δεν ήταν δυνατή η φόρτωση της AI ανάλυσης.');
            })
            .finally(() => setIsAiLoading(false));
    };

    const handlePreferencesSubmit = ({ labels, state }) => {
        setUserPreferences(labels);
        setPreferencesState(state);
        setIsPreferencesModalOpen(false);

        try {
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ labels, state }));
        } catch (err) {
            console.warn('Could not persist preferences to localStorage:', err);
        }

        // If a location is already selected, re-run the analysis with the new preferences
        if (selectedLocation) {
            fetchAnalysis(selectedLocation, labels);
        }
    };

    /**
     * Handle map click: Fetch environmental data from backend API.
     * Guests are redirected to /login on first interaction — the page itself stays open
     * so they can browse preferences without an account.
     */
    const handleMapClick = (latlng) => {
        if (isPreferencesModalOpen) return; // ignore clicks while modal is open
        if (authStatus !== 'authed') {
            navigate('/login');
            return;
        }
        setSelectedLocation(latlng);
        setIsDrawerOpen(true);
        fetchAnalysis(latlng, userPreferences);
    };

    const showSelectLocationPrompt = !isPreferencesModalOpen && !selectedLocation;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#e8eff7' }}>

            <Header
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                isMobile={isMobile}
                onEditPreferences={() => setIsPreferencesModalOpen(true)}
                isAuthed={authStatus === 'authed'}
            />

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <MapArea
                    selectedLocation={selectedLocation}
                    onMapClick={handleMapClick}
                    showSelectLocationPrompt={showSelectLocationPrompt}
                    onReopenPreferences={() => setIsPreferencesModalOpen(true)}
                />

                <Drawer
                    isDrawerOpen={isDrawerOpen}
                    setIsDrawerOpen={setIsDrawerOpen}
                    isMobile={isMobile}
                    selectedLocation={selectedLocation}
                    isLoading={isLoading}
                    isAiLoading={isAiLoading}
                    error={error}
                    apiData={apiData}
                    snapshotData={snapshotData}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />
            </div>

            {isPreferencesModalOpen && (
                <PreferencesModal
                    open={true}
                    onSubmit={handlePreferencesSubmit}
                    initialState={preferencesState}
                />
            )}

        </div>
    );
}
