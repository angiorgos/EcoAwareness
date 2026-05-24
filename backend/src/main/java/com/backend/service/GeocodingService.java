package com.backend.service;

import com.backend.model.NominatimResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Reverse geocoding μέσω Nominatim (OpenStreetMap). Δωρεάν, χωρίς API key.
 * Απαιτεί User-Agent header από τη Nominatim usage policy.
 * Rate limit: 1 request/second (αρκετό για το traffic της εφαρμογής).
 */
@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String getCityName(double lat, double lon) {
        String url = "https://nominatim.openstreetmap.org/reverse?lat=" + lat
                + "&lon=" + lon
                + "&format=json&accept-language=el";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoAwarenessApp/1.0 (educational project)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            var response = restTemplate.exchange(url, HttpMethod.GET, entity, NominatimResponse.class);
            if (response.getBody() != null && response.getBody().address() != null) {
                var addr = response.getBody().address();
                // Fallback chain: πιο συγκεκριμένο → πιο γενικό
                if (addr.city() != null)         return addr.city();
                if (addr.town() != null)         return addr.town();
                if (addr.village() != null)      return addr.village();
                if (addr.municipality() != null) return addr.municipality();
                if (addr.county() != null)       return addr.county();
            }
        } catch (Exception e) {
            System.err.println("Geocoding Service Error: " + e.getMessage());
        }
        return "Άγνωστη τοποθεσία";
    }
}