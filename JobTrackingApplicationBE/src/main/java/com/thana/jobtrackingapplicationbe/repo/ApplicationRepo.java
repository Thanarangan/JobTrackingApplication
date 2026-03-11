package com.thana.jobtrackingapplicationbe.repo;


import com.thana.jobtrackingapplicationbe.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepo extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByUser_Id(Long userId);
}
