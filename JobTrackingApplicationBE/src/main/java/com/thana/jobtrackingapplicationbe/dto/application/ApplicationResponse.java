package com.thana.jobtrackingapplicationbe.dto.application;

import java.time.LocalDate;

public class ApplicationResponse {
    private Long id;
    private Long userId;
    private String companyName;
    private String position;
    private String status;
    private String location;
    private String url;
    private Double salary;
    private LocalDate dateApplied;
    private String notes;

    public ApplicationResponse(Long id, Long userId, String companyName, String position, String status,
                               String location, String url, Double salary, LocalDate dateApplied, String notes) {
        this.id = id;
        this.userId = userId;
        this.companyName = companyName;
        this.position = position;
        this.status = status;
        this.location = location;
        this.url = url;
        this.salary = salary;
        this.dateApplied = dateApplied;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getCompanyName() { return companyName; }
    public String getPosition() { return position; }
    public String getStatus() { return status; }
    public String getLocation() { return location; }
    public String getUrl() { return url; }
    public Double getSalary() { return salary; }
    public LocalDate getDateApplied() { return dateApplied; }
    public String getNotes() { return notes; }
}