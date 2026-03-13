package com.thana.jobtrackingapplicationbe.service;

import com.thana.jobtrackingapplicationbe.model.ResumeFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class ResumeTextExtractor {

    public String extractText(ResumeFile resumeFile) {
        String fileName = resumeFile.getFileName() == null ? "" : resumeFile.getFileName().toLowerCase(Locale.ROOT);
        String contentType = resumeFile.getContentType() == null ? "" : resumeFile.getContentType().toLowerCase(Locale.ROOT);

        try {
            if (contentType.contains("pdf") || fileName.endsWith(".pdf")) {
                return normalize(extractPdf(resumeFile.getData()));
            }
            if (contentType.contains("wordprocessingml") || fileName.endsWith(".docx")) {
                return normalize(extractDocx(resumeFile.getData()));
            }
            if (contentType.contains("msword") || fileName.endsWith(".doc")) {
                return normalize(extractDoc(resumeFile.getData()));
            }
            if (contentType.startsWith("text/") || fileName.endsWith(".txt")) {
                return normalize(new String(resumeFile.getData(), StandardCharsets.UTF_8));
            }
        } catch (Exception ignored) {
            return "";
        }

        return "";
    }

    private String extractPdf(byte[] data) throws IOException {
        try (PDDocument document = Loader.loadPDF(data)) {
            return new PDFTextStripper().getText(document);
        }
    }

    private String extractDocx(byte[] data) throws IOException {
        try (
                ByteArrayInputStream inputStream = new ByteArrayInputStream(data);
                XWPFDocument document = new XWPFDocument(inputStream);
                XWPFWordExtractor extractor = new XWPFWordExtractor(document)
        ) {
            return extractor.getText();
        }
    }

    private String extractDoc(byte[] data) throws IOException {
        try (
                ByteArrayInputStream inputStream = new ByteArrayInputStream(data);
                HWPFDocument document = new HWPFDocument(inputStream);
                WordExtractor extractor = new WordExtractor(document)
        ) {
            return extractor.getText();
        }
    }

    private String normalize(String text) {
        return text == null ? "" : text.replace('\u0000', ' ').replaceAll("\\s+", " ").trim();
    }
}
