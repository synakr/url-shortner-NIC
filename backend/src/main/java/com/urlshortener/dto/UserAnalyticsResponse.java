package com.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAnalyticsResponse {

    private Long totalUrls;
    private Long activeUrls;
    private Long inactiveUrls;
    private Long totalClicks;
}
