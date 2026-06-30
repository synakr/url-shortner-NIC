package com.urlshortener.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClickAnalyticsResponse {
     private String country;
    private String city;
    private String referer;
    private String userAgent;
    private LocalDateTime clickedAt;
}
