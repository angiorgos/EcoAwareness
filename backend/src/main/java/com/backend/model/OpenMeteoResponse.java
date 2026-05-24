package com.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Raw response από api.open-meteo.com για το current solar bundle.
 * Περιλαμβάνει τωρινή ηλιακή ακτινοβολία + UV index + daily sunrise/sunset.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoResponse(Current current, Daily daily) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(
            @JsonProperty("shortwave_radiation") Double shortwaveRadiation,
            @JsonProperty("uv_index") Double uvIndex
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Daily(
            List<String> sunrise,   // ISO 8601, π.χ. ["2026-05-18T06:42"]
            List<String> sunset
    ) {}
}