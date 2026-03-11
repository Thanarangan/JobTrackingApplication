package com.thana.jobtrackingapplicationbe.controller;

import com.thana.jobtrackingapplicationbe.dto.application.ApplicationRequest;
import com.thana.jobtrackingapplicationbe.dto.application.ApplicationResponse;
import com.thana.jobtrackingapplicationbe.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody ApplicationRequest req) {
        return ResponseEntity.ok(applicationService.create(req));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ApplicationResponse>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> update(@PathVariable Long id, @Valid @RequestBody ApplicationRequest req) {
        return ResponseEntity.ok(applicationService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        applicationService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}