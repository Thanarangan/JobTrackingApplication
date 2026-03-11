package com.thana.jobtrackingapplicationbe.service;

import com.thana.jobtrackingapplicationbe.exception.ApiException;
import com.thana.jobtrackingapplicationbe.model.AppUser;
import com.thana.jobtrackingapplicationbe.model.ResumeFile;
import com.thana.jobtrackingapplicationbe.repo.ResumeRepo;
import com.thana.jobtrackingapplicationbe.repo.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ResumeService {

    private final ResumeRepo resumeRepo;
    private final UserRepo userRepo;

    public ResumeService(ResumeRepo resumeRepo, UserRepo userRepo) {
        this.resumeRepo = resumeRepo;
        this.userRepo = userRepo;
    }

    public Long upload(Long userId, MultipartFile file) {
        AppUser user = userRepo.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        try {
            ResumeFile r = new ResumeFile();
            r.setUser(user);
            r.setFileName(file.getOriginalFilename() == null ? "resume" : file.getOriginalFilename());
            r.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
            r.setData(file.getBytes());
            return resumeRepo.save(r).getId();
        } catch (Exception e) {
            throw new ApiException("Failed to upload resume: " + e.getMessage());
        }
    }

    public List<ResumeFile> list(Long userId) {
        return resumeRepo.findAllByUser_Id(userId);
    }

    public ResumeFile get(Long resumeId) {
        return resumeRepo.findById(resumeId).orElseThrow(() -> new ApiException("Resume not found"));
    }

    public void delete(Long resumeId) {
        if (!resumeRepo.existsById(resumeId)) throw new ApiException("Resume not found");
        resumeRepo.deleteById(resumeId);
    }
}