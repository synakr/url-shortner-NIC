package com.urlshortener.service;


import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;

import com.urlshortener.dto.GetUrlResponse;
import com.urlshortener.dto.UrlListResponse;

import jakarta.servlet.http.HttpServletRequest;

import com.urlshortener.dto.CreateUrlRequest;
import com.urlshortener.dto.GetAllUrlsResponse;

public interface UrlService {

        UrlListResponse getUrlsByUsername(String username, Pageable pageable);
        GetAllUrlsResponse shortenUrl(CreateUrlRequest request, String email);
        GetUrlResponse getOriginalUrl(String shortCode);
        List<GetAllUrlsResponse> getUserUrls(Long userId);
        UrlListResponse getExpiredUrlsByUser(String userId, LocalDateTime now, Pageable pageable);
        String resolveUrl(String shortCode, HttpServletRequest request);
        void deactivateUrl(Long id, String username);
        void activateUrl(Long id, String username);
}
