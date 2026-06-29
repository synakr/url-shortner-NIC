package com.urlshortener.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetAllUrlsResponse {

    private Long id;
    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private Long clickCount;
    private LocalDateTime createdAt;
}

