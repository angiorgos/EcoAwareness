package com.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Raw response από nominatim.openstreetmap.org/reverse.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimResponse(Address address) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Address(
            String city,
            String town,
            String village,
            String municipality,
            String county,
            String country
    ) {}
}