package com.thana.jobtrackingapplicationbe.repo;


import com.thana.jobtrackingapplicationbe.model.ResumeFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepo extends JpaRepository<ResumeFile, Long> {
    List<ResumeFile> findAllByUser_Id(Long userId);
}
