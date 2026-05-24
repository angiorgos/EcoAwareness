package com.backend.model;

import java.util.List;

/**
 * Τελική απάντηση του POST /api/best-time. Ενιαία πηγή για ΚΑΙ τα δύο views:
 *   - Τώρα view → weather/airQuality/solar/aiAnalysis (compatible με FullResponse)
 *   - Πρόβλεψη view → verdict/bestSlot/alternativeSlot/explanation/slots
 *
 * Όλα γεννιούνται σε ΕΝΑ LLM call → εγγυημένη συνέπεια μεταξύ Τώρα & Πρόβλεψη.
 */
public record BestTimeResponse(
        // ── Τωρινή κατάσταση (ίδιο shape με FullResponse) ────────────
        WeatherResponse weather,
        AirQualityResponse airQuality,
        SolarResponse solar,
        String aiAnalysis,
        String cityName,
        // ── Forecast/απόφαση ─────────────────────────────────────────
        String verdict,
        String bestSlot,
        String alternativeSlot,
        String explanation,
        List<ForecastSlot> slots
) {}
