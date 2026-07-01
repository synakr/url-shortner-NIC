package com.urlshortener.service.emailverification;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
