package com.urlshortener.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopUrlResponse {

    private Long id;
    private String originalUrl;
    private String shortUrl;
    private Long clickCount;
}
