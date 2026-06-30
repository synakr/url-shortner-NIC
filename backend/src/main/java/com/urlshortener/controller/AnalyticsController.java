package com.urlshortener.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.dto.AnalyticsResponse;
import com.urlshortener.dto.TopUrlResponse;
import com.urlshortener.dto.UserAnalyticsResponse;
import com.urlshortener.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/me")
    public ResponseEntity<UserAnalyticsResponse> getMyAnalytics(Authentication authentication) {

        return ResponseEntity.ok(analyticsService.getMyAnalytics(authentication.getName()));    //method defined in AnalyticsServiceImpl
    }

    @GetMapping("/{urlId}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long urlId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
         Authentication authentication) {

        return ResponseEntity.ok(
                analyticsService.getAnalytics(urlId, authentication.getName(), page, size)     //method defined in AnalyticsServiceImpl
        );
    }

    @GetMapping("/me/top")
    public ResponseEntity<List<TopUrlResponse>> getTopUrls(Authentication authentication, @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(
                analyticsService.getTopUrls(authentication.getName(),limit)    //method defined in AnalyticsServiceImpl
        );
    }
}
