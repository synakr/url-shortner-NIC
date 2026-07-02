package com.urlshortener.service;

import java.time.LocalDateTime;


import org.springframework.stereotype.Service;


import com.urlshortener.entity.AuditLog;
import com.urlshortener.entity.AuditEvent;
import com.urlshortener.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String username,
                    String email,
                    AuditEvent event,
                    String ip,
                    String userAgent,
                    String details) {

        AuditLog log = AuditLog.builder()
                .username(username)
                .email(email)
                .event(event)
                .ipAddress(ip)
                .userAgent(userAgent)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }
}