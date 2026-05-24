package com.backend.model;

/**
 * Solar bundle για το Τώρα view:
 *   - value/unit:  τρέχουσα ηλιακή ακτινοβολία (shortwave_radiation, W/m²)
 *   - uvIndex:     τρέχων δείκτης UV (0-11+)
 *   - sunrise:     ώρα ανατολής σήμερα (HH:mm, τοπική)
 *   - sunset:      ώρα δύσης σήμερα (HH:mm, τοπική)
 */
public record SolarResponse(
        double value,
        String unit,
        double uvIndex,
        String sunrise,
        String sunset
) {}