package com.backend.model;

/**
 * Request body για το POST /api/best-time.
 * Λαμβάνει συντεταγμένες και τις προτιμήσεις του χρήστη.
 */
public record BestTimeRequest(
        double lat,
        double lon,
        UserPreferences preferences
) {}
