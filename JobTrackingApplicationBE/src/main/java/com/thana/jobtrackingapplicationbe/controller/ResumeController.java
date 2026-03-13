package com.thana.jobtrackingapplicationbe.controller;

import com.thana.jobtrackingapplicationbe.dto.resume.ResumeAnalysisRequest;
import com.thana.jobtrackingapplicationbe.dto.resume.ResumeAnalysisResponse;
import com.thana.jobtrackingapplicationbe.model.ResumeFile;
import com.thana.jobtrackingapplicationbe.service.ResumeAnalysisService;
import com.thana.jobtrackingapplicationbe.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeAnalysisService resumeAnalysisService;

    public ResumeController(ResumeService resumeService, ResumeAnalysisService resumeAnalysisService) {
        this.resumeService = resumeService;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestParam Long userId, @RequestParam MultipartFile file) {
        Long resumeId = resumeService.upload(userId, file);
        return ResponseEntity.ok(Map.of("message", "Uploaded", "resumeId", resumeId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> list(@PathVariable Long userId) {
        var list = resumeService.list(userId).stream().map(r -> Map.<String, Object>of(
                "id", r.getId(),
                "fileName", r.getFileName(),
                "contentType", r.getContentType(),
                "uploadedAt", r.getUploadedAt()
        )).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{resumeId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long resumeId) {
        ResumeFile r = resumeService.get(resumeId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(r.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + r.getFileName() + "\"")
                .body(r.getData());
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<?> delete(@PathVariable Long resumeId) {
        resumeService.delete(resumeId);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @PostMapping("/analyze")
    public ResponseEntity<ResumeAnalysisResponse> analyze(@Valid @RequestBody ResumeAnalysisRequest request) {
        return ResponseEntity.ok(resumeAnalysisService.analyze(request.getUserId(), request.getJobDescription()));
    }
}
