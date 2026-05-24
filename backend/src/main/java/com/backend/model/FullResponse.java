package com.backend.model;

public record FullResponse(
        WeatherResponse weather,
        AirQualityResponse airQuality,
        SolarResponse solar,
        String aiAnalysis
) {
}
