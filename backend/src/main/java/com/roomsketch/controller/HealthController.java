package com.roomsketch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "RoomSketch Backend API");
        body.put("version", "1.0.0");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "RoomSketch Backend API");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
