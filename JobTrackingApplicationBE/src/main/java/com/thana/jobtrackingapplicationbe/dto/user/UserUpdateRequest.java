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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}