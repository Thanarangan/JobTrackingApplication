package com.thana.jobtrackingapplicationbe.dto.user;

public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private Integer age;
    private String headline;
    private String targetRole;
    private String preferredLocation;
    private String workMode;
    private String experienceLevel;
    private String skills;
    private String bio;
    private String avatarUrl;
    private String linkedInUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String preferredJobBoards;

    public UserResponse(
            Long id,
            String username,
            String name,
            String email,
            Integer age,
            String headline,
            String targetRole,
            String preferredLocation,
            String workMode,
            String experienceLevel,
            String skills,
            String bio,
            String avatarUrl,
            String linkedInUrl,
            String githubUrl,
            String portfolioUrl,
            String preferredJobBoards
    ) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.age = age;
        this.headline = headline;
        this.targetRole = targetRole;
        this.preferredLocation = preferredLocation;
        this.workMode = workMode;
        this.experienceLevel = experienceLevel;
        this.skills = skills;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.linkedInUrl = linkedInUrl;
        this.githubUrl = githubUrl;
        this.portfolioUrl = portfolioUrl;
        this.preferredJobBoards = preferredJobBoards;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Integer getAge() { return age; }
    public String getHeadline() { return headline; }
    public String getTargetRole() { return targetRole; }
    public String getPreferredLocation() { return preferredLocation; }
    public String getWorkMode() { return workMode; }
    public String getExperienceLevel() { return experienceLevel; }
    public String getSkills() { return skills; }
    public String getBio() { return bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getLinkedInUrl() { return linkedInUrl; }
    public String getGithubUrl() { return githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public String getPreferredJobBoards() { return preferredJobBoards; }
}
