package com.urlshortener.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urlshortener.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
