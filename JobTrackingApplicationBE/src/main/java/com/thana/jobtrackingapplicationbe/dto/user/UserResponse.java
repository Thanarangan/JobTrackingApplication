package com.thana.jobtrackingapplicationbe.dto.user;

public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private Integer age;

    public UserResponse(Long id, String username, String name, String email, Integer age) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.age = age;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Integer getAge() { return age; }
}
