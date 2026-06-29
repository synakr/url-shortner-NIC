package com.urlshortener.dto;


import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponse {

    private Long urlId;
    private String shortCode;
    private Long clickCount;
    private Boolean isActive;

    private Page<ClickAnalyticsResponse> clicks;
}
