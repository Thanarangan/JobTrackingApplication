package com.thana.jobtrackingapplicationbe.service;

import com.thana.jobtrackingapplicationbe.dto.resume.ResumeAnalysisResponse;
import com.thana.jobtrackingapplicationbe.dto.resume.ResumeAnalysisResult;
import com.thana.jobtrackingapplicationbe.exception.ApiException;
import com.thana.jobtrackingapplicationbe.model.ResumeFile;
import com.thana.jobtrackingapplicationbe.repo.ResumeRepo;
import com.thana.jobtrackingapplicationbe.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAnalysisService {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "into", "is",
            "it", "of", "on", "or", "that", "the", "their", "this", "to", "with", "will", "you", "your", "we",
            "our", "they", "them", "who", "about", "after", "before", "during", "using", "used", "use", "should",
            "must", "can", "may", "able", "such", "than", "then", "over", "under", "through", "across", "per"
    );

    private static final List<String> KNOWN_SKILLS = List.of(
            "java", "spring", "spring boot", "hibernate", "jpa", "sql", "postgresql", "mysql", "mongodb",
            "rest api", "microservices", "docker", "kubernetes", "aws", "azure", "gcp", "react", "redux",
            "javascript", "typescript", "html", "css", "tailwind", "node.js", "express", "python", "django",
            "flask", "git", "github", "ci/cd", "jenkins", "maven", "gradle", "jwt", "oauth", "testing",
            "junit", "vitest", "selenium", "playwright", "agile", "scrum", "figma", "linux", "redis", "graphql"
    );

    private static final Pattern TOKEN_SPLIT = Pattern.compile("[^a-z0-9+#.]+");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?\\d[\\d\\s().-]{7,}\\d)");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("linkedin\\.com", Pattern.CASE_INSENSITIVE);
    private static final Pattern GITHUB_PATTERN = Pattern.compile("github\\.com", Pattern.CASE_INSENSITIVE);
    private static final Pattern METRIC_PATTERN = Pattern.compile("(\\d+%|\\d+\\+|\\$\\d+|\\d+ years?)", Pattern.CASE_INSENSITIVE);

    private final ResumeRepo resumeRepo;
    private final UserRepo userRepo;
    private final ResumeTextExtractor resumeTextExtractor;

    public ResumeAnalysisService(ResumeRepo resumeRepo, UserRepo userRepo, ResumeTextExtractor resumeTextExtractor) {
        this.resumeRepo = resumeRepo;
        this.userRepo = userRepo;
        this.resumeTextExtractor = resumeTextExtractor;
    }

    public ResumeAnalysisResponse analyze(Long userId, String jobDescription) {
        userRepo.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        List<ResumeFile> resumes = resumeRepo.findAllByUser_Id(userId);
        if (resumes.isEmpty()) {
            throw new ApiException("Upload resumes before running analysis");
        }

        String normalizedJobDescription = normalize(jobDescription);
        List<String> jobSkills = extractSkills(normalizedJobDescription);
        List<String> topKeywords = extractTopKeywords(normalizedJobDescription, 15);

        List<ResumeAnalysisResult> ranked = resumes.stream()
                .map(resume -> analyzeResume(resume, normalizedJobDescription, jobSkills, topKeywords))
                .sorted(Comparator.comparingInt(ResumeAnalysisResult::getAtsScore).reversed()
                        .thenComparing(ResumeAnalysisResult::getFileName))
                .limit(3)
                .toList();

        ResumeAnalysisResponse response = new ResumeAnalysisResponse();
        response.setAnalyzedCount(resumes.size());
        response.setJobSkills(jobSkills);
        response.setTopKeywords(topKeywords);
        response.setTopMatches(ranked);
        return response;
    }

    private ResumeAnalysisResult analyzeResume(
            ResumeFile resume,
            String normalizedJobDescription,
            List<String> jobSkills,
            List<String> topKeywords
    ) {
        String resumeText = normalize(resumeTextExtractor.extractText(resume));
        List<String> resumeSkills = extractSkills(resumeText);
        List<String> matchingSkills = intersection(jobSkills, resumeSkills);
        List<String> missingSkills = difference(jobSkills, resumeSkills);
        List<String> matchedKeywords = topKeywords.stream()
                .filter(keyword -> containsPhrase(resumeText, keyword))
                .limit(8)
                .toList();

        double keywordCoverage = topKeywords.isEmpty() ? 0 : (double) matchedKeywords.size() / topKeywords.size();
        double skillCoverage = jobSkills.isEmpty() ? keywordCoverage : (double) matchingSkills.size() / jobSkills.size();
        double structureScore = computeStructureScore(resumeText);

        int atsScore = (int) Math.round(Math.min(
                100,
                keywordCoverage * 45 + skillCoverage * 35 + structureScore * 20
        ));

        ResumeAnalysisResult result = new ResumeAnalysisResult();
        result.setResumeId(resume.getId());
        result.setFileName(resume.getFileName());
        result.setAtsScore(atsScore);
        result.setMatchingSkills(matchingSkills);
        result.setMissingSkills(missingSkills.stream().limit(6).toList());
        result.setMatchedKeywords(matchedKeywords);
        result.setSuggestions(buildSuggestions(resumeText, normalizedJobDescription, matchedKeywords, missingSkills, structureScore));
        result.setSummary(buildSummary(matchingSkills, matchedKeywords, atsScore));
        return result;
    }

    private List<String> buildSuggestions(
            String resumeText,
            String normalizedJobDescription,
            List<String> matchedKeywords,
            List<String> missingSkills,
            double structureScore
    ) {
        List<String> suggestions = new ArrayList<>();

        if (resumeText.isBlank()) {
            suggestions.add("This file could not be parsed cleanly. Upload a text-based PDF or DOCX resume.");
            return suggestions;
        }
        if (!missingSkills.isEmpty()) {
            suggestions.add("Add or strengthen evidence for: " + String.join(", ", missingSkills.stream().limit(3).toList()) + ".");
        }
        if (matchedKeywords.size() < 5) {
            suggestions.add("Mirror more job-description wording in the summary, skills, and experience sections.");
        }
        if (structureScore < 0.75) {
            suggestions.add("Improve ATS structure with clear contact info, a skills section, and quantified achievements.");
        }
        if (!METRIC_PATTERN.matcher(resumeText).find()) {
            suggestions.add("Include measurable outcomes such as percentages, revenue impact, or delivery metrics.");
        }
        if (!containsPhrase(resumeText, "summary") && !containsPhrase(normalizedJobDescription, "summary")) {
            suggestions.add("Add a short professional summary tailored to this role.");
        }

        return suggestions.stream().distinct().limit(4).toList();
    }

    private String buildSummary(List<String> matchingSkills, List<String> matchedKeywords, int atsScore) {
        if (atsScore >= 80) {
            return "Strong overall fit with high keyword and skill alignment.";
        }
        if (!matchingSkills.isEmpty()) {
            return "Good fit driven by matching skills such as " + String.join(", ", matchingSkills.stream().limit(3).toList()) + ".";
        }
        if (!matchedKeywords.isEmpty()) {
            return "Moderate fit based on shared terminology, but the resume needs stronger targeted skills coverage.";
        }
        return "Low fit because the resume does not yet reflect enough of the job description language.";
    }

    private double computeStructureScore(String resumeText) {
        if (resumeText.isBlank()) {
            return 0;
        }

        int points = 0;
        if (EMAIL_PATTERN.matcher(resumeText).find()) {
            points++;
        }
        if (PHONE_PATTERN.matcher(resumeText).find()) {
            points++;
        }
        if (containsPhrase(resumeText, "experience")) {
            points++;
        }
        if (containsPhrase(resumeText, "skills")) {
            points++;
        }
        if (METRIC_PATTERN.matcher(resumeText).find()) {
            points++;
        }
        if (LINKEDIN_PATTERN.matcher(resumeText).find() || GITHUB_PATTERN.matcher(resumeText).find()) {
            points++;
        }

        return points / 6.0;
    }

    private List<String> extractSkills(String text) {
        return KNOWN_SKILLS.stream()
                .filter(skill -> containsPhrase(text, skill))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<String> extractTopKeywords(String text, int limit) {
        Map<String, Long> frequencies = Arrays.stream(TOKEN_SPLIT.split(text))
                .map(String::trim)
                .filter(token -> token.length() > 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .collect(Collectors.groupingBy(token -> token, LinkedHashMap::new, Collectors.counting()));

        return frequencies.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .distinct()
                .limit(limit)
                .toList();
    }

    private List<String> intersection(List<String> left, List<String> right) {
        Set<String> rightSet = new LinkedHashSet<>(right);
        return left.stream().filter(rightSet::contains).distinct().toList();
    }

    private List<String> difference(List<String> left, List<String> right) {
        Set<String> rightSet = new LinkedHashSet<>(right);
        return left.stream().filter(value -> !rightSet.contains(value)).distinct().toList();
    }

    private boolean containsPhrase(String text, String phrase) {
        String normalizedText = " " + text + " ";
        String normalizedPhrase = " " + normalize(phrase) + " ";
        return normalizedText.contains(normalizedPhrase);
    }

    private String normalize(String text) {
        return text == null
                ? ""
                : text.toLowerCase(Locale.ROOT)
                .replaceAll("[\\r\\n\\t]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
