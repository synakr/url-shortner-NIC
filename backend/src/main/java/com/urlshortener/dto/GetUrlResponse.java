package com.urlshortener.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GetUrlResponse{

     private Long id;
    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private Long clickCount;
    private Boolean isActive;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private String username;
}