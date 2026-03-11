package com.thana.jobtrackingapplicationbe.dto.application;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class ApplicationRequest {

    private Long userId;

    @NotBlank
    private String companyName;

    @NotBlank
    private String position;

    @NotBlank
    private String status;

    private String location;
    private String url;
    private Double salary;
    private LocalDate dateApplied;
    private String notes;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }

    public LocalDate getDateApplied() { return dateApplied; }
    public void setDateApplied(LocalDate dateApplied) { this.dateApplied = dateApplied; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
