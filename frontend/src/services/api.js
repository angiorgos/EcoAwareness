import axios from 'axios';

// Use proxy in development, dynamic protocol in production
const API_BASE_URL = import.meta.env.DEV
    ? '/api'
    : `${window.location.protocol}//${window.location.hostname}/api`;

console.log(`🔌 API BASE URL: ${API_BASE_URL}`);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true, // send JSESSIONID cookie with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.params);
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(`📥 API Response: ${response.status}`, response.data);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

/**
 * Γρήγορο snapshot: weather + airQuality + solar για άμεσο rendering των cards.
 * Δεν περιλαμβάνει AI ανάλυση ή forecast. ~1s vs ~3-4s του fetchBestTime.
 */
export const fetchSnapshot = async (lat, lon) => {
    const response = await apiClient.get('/snapshot', {
        params: { lat: parseFloat(lat), lon: parseFloat(lon) },
    });
    return response.data;
};

/**
 * Best-time recommendation: τωρινή κατάσταση + καλύτερο 3ωρο παράθυρο + verdict + slots.
 * Backed by AI structured output (POST /api/best-time).
 */
export const fetchBestTime = async (lat, lon, preferences) => {
    try {
        const response = await apiClient.post('/best-time', {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            preferences: {
                profile: preferences?.profile ?? [],
                activities: preferences?.activities ?? [],
            },
        });
        return response.data;
    } catch (error) {
        const customError = new Error('Δεν ήταν δυνατή η φόρτωση της πρόβλεψης.');
        customError.originalError = error;
        throw customError;
    }
};

/**
 * Login user with email and password (session-based).
 */
export const loginUser = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        let userMessage = 'Δεν ήταν δυνατή η σύνδεση. Ελέγξτε τα στοιχεία σας.';

        if (error.response?.status === 401) {
            userMessage = 'Email ή κωδικός λάθος.';
        } else if (error.response?.status === 404) {
            userMessage = 'Ο χρήστης δεν βρέθηκε.';
        } else if (error.response?.status === 500) {
            userMessage = 'Σφάλμα διακομιστή. Δοκιμάστε ξανά.';
        } else if (error.message === 'Network Error') {
            userMessage = 'Σφάλμα δικτύου. Δεν είναι δυνατή η σύνδεση.';
        } else if (!error.response) {
            userMessage = `Σφάλμα σύνδεσης: ${error.message}`;
        }

        const customError = new Error(userMessage);
        customError.originalError = error;
        throw customError;
    }
};

/**
 * Register new user (also logs them in automatically).
 */
export const registerUser = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/register', { email, password });
        return response.data;
    } catch (error) {
        let userMessage = 'Δεν ήταν δυνατή η εγγραφή. Δοκιμάστε ξανά.';

        if (error.response?.status === 400) {
            userMessage = error.response.data?.message || 'Τα στοιχεία σας είναι ακατάλληλα.';
        } else if (error.response?.status === 409) {
            userMessage = error.response.data?.message || 'Ο χρήστης υπάρχει ήδη.';
        } else if (error.response?.status === 500) {
            userMessage = 'Σφάλμα διακομιστή. Δοκιμάστε ξανά.';
        } else if (error.message === 'Network Error') {
            userMessage = 'Σφάλμα δικτύου. Δεν είναι δυνατή η σύνδεση.';
        } else if (!error.response) {
            userMessage = `Σφάλμα σύνδεσης: ${error.message}`;
        }

        const customError = new Error(userMessage);
        customError.originalError = error;
        throw customError;
    }
};

/**
 * Logout user by invalidating the session on the server.
 */
export const logoutUser = async () => {
    try {
        await apiClient.post('/auth/logout');
    } catch (error) {
        console.warn('Logout request failed (continuing anyway):', error.message);
    }
};

/**
 * Check whether the current session is authenticated.
 * Returns user info on success, or null on 401/network failure.
 */
export const checkAuth = async () => {
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            return null;
        }
        // Treat network or unexpected errors as "not logged in"
        console.warn('checkAuth failed:', error.message);
        return null;
    }
};

export default apiClient;
