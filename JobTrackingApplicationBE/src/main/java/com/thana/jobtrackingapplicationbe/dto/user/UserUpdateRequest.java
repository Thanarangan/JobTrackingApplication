package com.thana.jobtrackingapplicationbe.dto.user;

import jakarta.validation.constraints.*;

public class UserUpdateRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @Email
    @NotBlank
    private String email;

    @Min(1)
    @Max(120)
    private Integer age;

    @Size(max = 160)
    private String headline;

    @Size(max = 120)
    private String targetRole;

    @Size(max = 120)
    private String preferredLocation;

    @Size(max = 40)
    private String workMode;

    @Size(max = 40)
    private String experienceLevel;

    @Size(max = 500)
    private String skills;

    @Size(max = 2000)
    private String bio;

    @Size(max = 2000000)
    private String avatarUrl;

    @Size(max = 500)
    private String linkedInUrl;

    @Size(max = 500)
    private String githubUrl;

    @Size(max = 500)
    private String portfolioUrl;

    @Size(max = 500)
    private String preferredJobBoards;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getLinkedInUrl() { return linkedInUrl; }
    public void setLinkedInUrl(String linkedInUrl) { this.linkedInUrl = linkedInUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getPreferredJobBoards() { return preferredJobBoards; }
    public void setPreferredJobBoards(String preferredJobBoards) { this.preferredJobBoards = preferredJobBoards; }
}
