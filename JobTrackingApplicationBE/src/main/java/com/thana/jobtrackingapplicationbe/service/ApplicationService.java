package com.thana.jobtrackingapplicationbe.service;

import com.thana.jobtrackingapplicationbe.dto.application.ApplicationRequest;
import com.thana.jobtrackingapplicationbe.dto.application.ApplicationResponse;
import com.thana.jobtrackingapplicationbe.exception.ApiException;
import com.thana.jobtrackingapplicationbe.model.AppUser;
import com.thana.jobtrackingapplicationbe.model.JobApplication;
import com.thana.jobtrackingapplicationbe.repo.ApplicationRepo;
import com.thana.jobtrackingapplicationbe.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepo applicationRepo;
    private final UserRepo userRepo;

    public ApplicationService(ApplicationRepo applicationRepo, UserRepo userRepo) {
        this.applicationRepo = applicationRepo;
        this.userRepo = userRepo;
    }

    public ApplicationResponse create(ApplicationRequest req) {
        AppUser user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new ApiException("User not found"));

        JobApplication a = new JobApplication();
        a.setUser(user);
        a.setCompanyName(req.getCompanyName());
        a.setPosition(req.getPosition());
        a.setStatus(req.getStatus());
        a.setLocation(req.getLocation());
        a.setUrl(req.getUrl());
        a.setSalary(req.getSalary());
        a.setDateApplied(req.getDateApplied());
        a.setNotes(req.getNotes());

        return map(applicationRepo.save(a));
    }

    public List<ApplicationResponse> getByUser(Long userId) {
        return applicationRepo.findAllByUser_Id(userId).stream().map(this::map).toList();
    }

    public ApplicationResponse getOne(Long id) {
        JobApplication a = applicationRepo.findById(id).orElseThrow(() -> new ApiException("Application not found"));
        return map(a);
    }

    public ApplicationResponse update(Long id, ApplicationRequest req) {
        JobApplication a = applicationRepo.findById(id).orElseThrow(() -> new ApiException("Application not found"));

        if (req.getUserId() != null && !a.getUser().getId().equals(req.getUserId())) {
            AppUser user = userRepo.findById(req.getUserId())
                    .orElseThrow(() -> new ApiException("User not found"));
            a.setUser(user);
        }

        a.setCompanyName(req.getCompanyName());
        a.setPosition(req.getPosition());
        a.setStatus(req.getStatus());
        a.setLocation(req.getLocation());
        a.setUrl(req.getUrl());
        a.setSalary(req.getSalary());
        a.setDateApplied(req.getDateApplied());
        a.setNotes(req.getNotes());

        return map(applicationRepo.save(a));
    }

    public void delete(Long id) {
        if (!applicationRepo.existsById(id)) throw new ApiException("Application not found");
        applicationRepo.deleteById(id);
    }

    private ApplicationResponse map(JobApplication a) {
        return new ApplicationResponse(
                a.getId(),
                a.getUser().getId(),
                a.getCompanyName(),
                a.getPosition(),
                a.getStatus(),
                a.getLocation(),
                a.getUrl(),
                a.getSalary(),
                a.getDateApplied(),
                a.getNotes()
        );
    }
}