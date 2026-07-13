package com.urlshortener.service.emailverification;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        System.out.println("==================================================");
        System.out.println("SENDING EMAIL (LOCAL DEVELOPMENT BACKUP LOG):");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY:\n" + body);
        System.out.println("==================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("no-reply@yourapp.com");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("SMTP send failed (expected in local dev without real mail configuration): " + e.getMessage());
        }
    }
}
