package com.backend.controller;

import com.backend.model.BestTimeRequest;
import com.backend.model.BestTimeResponse;
import com.backend.model.FullResponse;
import com.backend.service.EnvironmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Thin HTTP layer — όλη η business logic ζει στο EnvironmentService. Αυτός ο
 * controller κάνει μόνο routing και delegation.
 *
 * Εκθέτει μόνο τα δύο composite endpoints που χρησιμοποιεί το frontend:
 *   GET  /api/snapshot   — γρήγορη απάντηση με τρέχοντα δεδομένα (χωρίς AI)
 *   POST /api/best-time  — πλήρης απάντηση με AI ανάλυση + 24h forecast
 */
@RestController
@RequestMapping("/api")
public class MainController {

    private final EnvironmentService environmentService;

    public MainController(EnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    @GetMapping("/snapshot")
    public ResponseEntity<FullResponse> getSnapshot(@RequestParam double lat, @RequestParam double lon) {
        return ResponseEntity.ok(environmentService.getSnapshot(lat, lon));
    }

    @PostMapping("/best-time")
    public ResponseEntity<BestTimeResponse> getBestTime(@RequestBody BestTimeRequest request) {
        return ResponseEntity.ok(
                environmentService.getBestTime(request.lat(), request.lon(), request.preferences())
        );
    }
}
