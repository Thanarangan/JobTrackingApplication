package com.thana.jobtrackingapplicationbe.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}