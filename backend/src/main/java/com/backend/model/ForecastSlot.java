package com.backend.model;

/**
 * Ένα χρονικό παράθυρο 3 ωρών με όλες τις περιβαλλοντικές μετρήσεις.
 * Παράγεται από το EnvironmentService.assembleSlots(...) και ταξιδεύει
 * στο BestTimeResponse.slots ως input για το LLM και το ForecastTimeline.
 */
public record ForecastSlot(
        String timestamp,      // ISO 8601, π.χ. "2026-05-18T18:00"
        String localTime,      // π.χ. "18:00" — για άμεση εμφάνιση στο UI
        double temp,
        int humidity,
        double windSpeed,      // km/h
        String description,    // π.χ. "λίγα σύννεφα"
        int aqi,               // 1-5
        double pm25,
        double pm10,
        double no2,
        double o3,
        double uvIndex,
        double solarRadiation  // W/m²
) {}