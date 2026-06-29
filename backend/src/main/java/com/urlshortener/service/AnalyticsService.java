package com.urlshortener.service;


import java.util.List;

import com.urlshortener.dto.AnalyticsResponse;
import com.urlshortener.dto.TopUrlResponse;
import com.urlshortener.dto.UserAnalyticsResponse;


public interface AnalyticsService {
    public AnalyticsResponse getAnalytics(Long urlId, String username, int page, int size);
    public List<TopUrlResponse> getTopUrls(String username, int limit);
    public UserAnalyticsResponse getMyAnalytics(String email);

    public void trackClickAsync(String shortCode, String ip, String userAgent, String referer);
}
