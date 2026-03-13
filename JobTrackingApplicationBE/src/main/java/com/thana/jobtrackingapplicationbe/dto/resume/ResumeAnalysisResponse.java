package com.thana.jobtrackingapplicationbe.dto.resume;

import java.util.List;

public class ResumeAnalysisResponse {

    private int analyzedCount;
    private List<String> jobSkills;
    private List<String> topKeywords;
    private List<ResumeAnalysisResult> topMatches;

    public int getAnalyzedCount() {
        return analyzedCount;
    }

    public void setAnalyzedCount(int analyzedCount) {
        this.analyzedCount = analyzedCount;
    }

    public List<String> getJobSkills() {
        return jobSkills;
    }

    public void setJobSkills(List<String> jobSkills) {
        this.jobSkills = jobSkills;
    }

    public List<String> getTopKeywords() {
        return topKeywords;
    }

    public void setTopKeywords(List<String> topKeywords) {
        this.topKeywords = topKeywords;
    }

    public List<ResumeAnalysisResult> getTopMatches() {
        return topMatches;
    }

    public void setTopMatches(List<ResumeAnalysisResult> topMatches) {
        this.topMatches = topMatches;
    }
}
