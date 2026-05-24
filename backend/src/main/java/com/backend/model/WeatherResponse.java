package com.backend.model;

public record WeatherResponse(
        String cityName,
        double temperature,
        String tempUnit, // °C
        double humidity,
        String humidityUnit, // %
        double windSpeed,
        String windSpeedUnit, // m/s
        String description,
        String localTime, // π.χ. "16:30"
        String source
) {}