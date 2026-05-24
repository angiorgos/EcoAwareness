package com.backend.model;

public record AirQualityResponse(
        int aqi,
        double o3,
        double no2,
        double pm2_5,
        double pm10,
        String aqi_status,
        String pm2_5_status,
        String pm10_status,
        String no2_status,
        String o3_status,
        String source
) {}