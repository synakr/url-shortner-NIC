package com.urlshortener.service;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.*;
import com.urlshortener.entity.ClickAnalytics;
import com.urlshortener.entity.Url;
import com.urlshortener.entity.User;
import com.urlshortener.exception.AccessDeniedException;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.repository.ClickAnalyticsRepository;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final ClickAnalyticsRepository clickAnalyticsRepository;
    private final GeoService geoService; 
    private final AppProperties appProperties;

    @Override
    @Async 
    @Transactional 
    public void trackClickAsync(String shortCode, String ip, String userAgent, String referer) {
        Url url = urlRepository.findByShortCode(shortCode).orElse(null);
        if (url == null) {
            return; 
        }

        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);

        GeoResponse geo;
        try {
            geo = geoService.getLocation(ip);
        } catch (Exception e) {
            geo = new GeoResponse("Unknown","Unknown");
        }

        ClickAnalytics analytics = ClickAnalytics.builder()
                .url(url)
                .ipAddress(ip)
                .userAgent(userAgent)
                .referer(referer)
                .country(geo.getCountry())
                .city(geo.getCity())
                .clickedAt(LocalDateTime.now())
                .build();

        clickAnalyticsRepository.save(analytics);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(Long urlId, String username, int page, int size) {
        Url url = urlRepository.findById(urlId)
        .orElseThrow(() -> new UrlNotFoundException("URL not found"));

        if(!url.getUser().getUsername().equals(username)){
                throw new AccessDeniedException("Access denied");
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<ClickAnalyticsResponse> clickPage = clickAnalyticsRepository
                .findByUrl_Id(urlId, pageable)
                .map(click -> new ClickAnalyticsResponse(
                        click.getCountry(),
                        click.getCity(),
                        click.getReferer(),
                        click.getUserAgent(),
                        click.getClickedAt()
                ));

        return new AnalyticsResponse(
                url.getId(),
                url.getShortCode(),
                url.getClickCount(),
                url.getIsActive(),
                clickPage
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserAnalyticsResponse getMyAnalytics(String username) {
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));

        Long totalUrls = urlRepository.countByUserId(user.getId());
        Long activeUrls = urlRepository.countByUserAndIsActiveTrue(user);
        Long inactiveUrls = urlRepository.countByUserAndIsActiveFalse(user);
        Long totalClicks = urlRepository.getTotalClicks(user);

        return new UserAnalyticsResponse(totalUrls, activeUrls, inactiveUrls, totalClicks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopUrlResponse> getTopUrls(String username, int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return urlRepository.findByUserUsernameOrderByClickCountDesc(username, pageable)
                .stream()
                .map(url -> TopUrlResponse.builder()
                        .id(url.getId())
                        .originalUrl(url.getOriginalUrl())
                        .shortUrl(appProperties.getBaseUrl()+"/" + url.getShortCode())
                        .clickCount(url.getClickCount())
                        .build())
                .toList();
    }
}