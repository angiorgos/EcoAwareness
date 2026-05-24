package com.backend.model;

import java.util.List;

public record UserPreferences(
        List<String> profile,
        List<String> activities
) {
    public UserPreferences {
        if (profile == null) profile = List.of();
        if (activities == null) activities = List.of();
    }
}