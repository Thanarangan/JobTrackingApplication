package com.thana.jobtrackingapplicationbe.service;



import com.thana.jobtrackingapplicationbe.dto.user.UserResponse;
import com.thana.jobtrackingapplicationbe.dto.user.UserUpdateRequest;
import com.thana.jobtrackingapplicationbe.exception.ApiException;
import com.thana.jobtrackingapplicationbe.model.AppUser;
import com.thana.jobtrackingapplicationbe.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public UserResponse getById(Long id) {
        AppUser u = userRepo.findById(id).orElseThrow(() -> new ApiException("User not found"));
        return map(u);
    }

    public List<UserResponse> getAll() {
        return userRepo.findAll().stream().map(this::map).toList();
    }

    public UserResponse update(Long id, UserUpdateRequest req) {
        AppUser u = userRepo.findById(id).orElseThrow(() -> new ApiException("User not found"));
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setAge(req.getAge());
        u.setHeadline(req.getHeadline());
        u.setTargetRole(req.getTargetRole());
        u.setPreferredLocation(req.getPreferredLocation());
        u.setWorkMode(req.getWorkMode());
        u.setExperienceLevel(req.getExperienceLevel());
        u.setSkills(req.getSkills());
        u.setBio(req.getBio());
        u.setAvatarUrl(req.getAvatarUrl());
        u.setLinkedInUrl(req.getLinkedInUrl());
        u.setGithubUrl(req.getGithubUrl());
        u.setPortfolioUrl(req.getPortfolioUrl());
        u.setPreferredJobBoards(req.getPreferredJobBoards());
        return map(userRepo.save(u));
    }

    public void delete(Long id) {
        if (!userRepo.existsById(id)) throw new ApiException("User not found");
        userRepo.deleteById(id);
    }

    private UserResponse map(AppUser u) {
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getName(),
                u.getEmail(),
                u.getAge(),
                u.getHeadline(),
                u.getTargetRole(),
                u.getPreferredLocation(),
                u.getWorkMode(),
                u.getExperienceLevel(),
                u.getSkills(),
                u.getBio(),
                u.getAvatarUrl(),
                u.getLinkedInUrl(),
                u.getGithubUrl(),
                u.getPortfolioUrl(),
                u.getPreferredJobBoards()
        );
    }
}
