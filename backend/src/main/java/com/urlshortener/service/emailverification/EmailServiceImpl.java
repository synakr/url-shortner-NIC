package com.urlshortener.service.emailverification;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.resend.services.emails.model.SendEmailRequest;

import jakarta.annotation.PostConstruct;

import com.resend.Resend;
import com.resend.core.exception.ResendException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    private Resend resend;

    @PostConstruct
    public void init() {
        this.resend = new Resend(apiKey);
    }

    @Async
    @Override
    public void sendEmail(String to, String subject, String body) {
        SendEmailRequest params = SendEmailRequest.builder()
            .from("onboarding@resend.dev")
            .to(to)
            .subject(subject)
            .text(body)
            .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            e.printStackTrace();
        }
    }
}