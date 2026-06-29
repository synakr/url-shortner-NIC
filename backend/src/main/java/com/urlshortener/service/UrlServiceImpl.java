package com.urlshortener.service;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.*;
import com.urlshortener.entity.Url;
import com.urlshortener.entity.User;
import com.urlshortener.exception.InvalidExpiryException;
import com.urlshortener.exception.TooManyRequestsException;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.exception.UserNotFoundException;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final RateLimiterService rateLimiterService;
    private final AnalyticsService analyticsService; 
    private final AppProperties appProperties;

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    @Transactional
    public void deactivateUrl(Long id, String username) {
        Url url = urlRepository.findByIdAndUserUsername(id, username)
        .orElseThrow(() -> new UrlNotFoundException("URL not found"));

        if (!url.getIsActive()) {
            throw new RuntimeException("URL is already inactive");
        }
        redisTemplate.delete("url:" + url.getShortCode());
        url.setIsActive(false);
        urlRepository.save(url);
    }

    @Override
    @Transactional
    public void activateUrl(Long id, String username) {
        Url url = urlRepository.findByIdAndUserUsername(id, username)
        .orElseThrow(() -> new UrlNotFoundException("URL not found"));

        if (url.getIsActive()) {
            throw new RuntimeException("URL is already active");
        }

        if(!url.getIsActive()) {
            if (url.getExpiredAt() != null) {
                LocalDateTime deadline =
                        url.getExpiredAt()
                        .plusDays(appProperties.getUrl().getGracePeriodDays());

                if (LocalDateTime.now().isAfter(deadline)) {
                    throw new RuntimeException(
                        "Grace period ended. URL cannot be reactivated."
                    );
                }
                url.setExpiresAt(
                    LocalDateTime.now()
                        .plusDays(appProperties.getUrl().getDefaultExtendDays())
                );
            }
            url.setIsActive(true);
        }


        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (urlRepository.countByUserIdAndIsActiveTrue(user.getId()) >= appProperties.getUrl().getMaxActiveUrls()) {
            throw new RuntimeException("Active URL limit reached");
        }

        url.setIsActive(true);
        urlRepository.save(url);
    }

    @Override
    @Transactional
    public GetAllUrlsResponse shortenUrl(CreateUrlRequest request, String username) {
        rateLimiterService.checkRateLimit("rate:url:" + username,appProperties.getRateLimit().getShortenUrl());

        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UserNotFoundException("User not found"));

        String normalizedUrl =normalizeUrl(request.getOriginalUrl());

        Url existing = urlRepository.findByUserIdAndOriginalUrl(user.getId(), normalizedUrl)
        .orElse(null);

        int days= ((request.getExpiryDays()==null)?appProperties.getUrl().getDefaultExpiryDays():request.getExpiryDays());

        if (days<=0) {
            throw new InvalidExpiryException("Expiry days must be more than 0 days");
        }
        if(days>appProperties.getUrl().getMaxExpiryDays()){
            throw new RuntimeException("Expiry exceeds maximum limit: "+ appProperties.getUrl().getMaxExpiryDays()+" days");
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusDays(days);

        if (existing != null) {
            if (!existing.getIsActive()) {
                existing.setIsActive(true);
                existing.setExpiresAt(expiresAt);
                urlRepository.save(existing);
            }
            return mapToResponse(existing);
        }

        if (urlRepository.countByUserIdAndIsActiveTrue(user.getId())>=appProperties.getUrl().getMaxActiveUrls()) {
            throw new RuntimeException("Active URL limit reached");
        }

        String shortCode = generateUniqueShortCode();

        Url url = Url.builder()
                .originalUrl(normalizedUrl)
                .shortCode(shortCode)
                .user(user)
                .clickCount(0L)
                .isActive(true)
                .expiresAt(expiresAt)
                .build();

        Url savedUrl = urlRepository.save(url);
        return mapToResponse(savedUrl);
    }

    private String normalizeUrl(String url) {

        url = url.trim();

        if (!url.startsWith("http://")
                && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        try {

            URI uri = new URI(url);

            String scheme = "https";

            String host = uri.getHost();

            if (host != null) {
                host = host.toLowerCase();
            }

            String path = uri.getPath();
            if (path == null) {
                path = "";
            }

            String query = uri.getQuery();

            URI normalized = new URI(
                    scheme,
                    null,
                    host,
                    -1,
                    path,
                    query,
                    null
            );

            return normalized.toString();

        } catch (Exception e) {
            throw new RuntimeException("Invalid URL");
        }
    }


    @Override
    @Transactional(readOnly = true)
    public GetUrlResponse getOriginalUrl(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
        .orElseThrow(() -> new UrlNotFoundException("URL not found"));
        return mapToGetResponse(url);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GetAllUrlsResponse> getUserUrls(Long userId) {
        return urlRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public String resolveUrl(String shortCode, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String fingerprint = DigestUtils.sha256Hex(ip + ":" + userAgent);

        String blockedKey = "blocked:" + fingerprint;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(blockedKey))) {
            throw new TooManyRequestsException("Suspicious activity detected. Try again later.");
        }

        String cacheKey = "url:" + shortCode;
        String originalUrl = redisTemplate.opsForValue().get(cacheKey);

        if (originalUrl == null) {
            Url url = urlRepository.findByShortCode(shortCode)
                    .orElseThrow(() -> new UrlNotFoundException("URL not found"));

            if (!url.getIsActive()) {
                throw new UrlNotFoundException("URL is disabled");
            }

            if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
                url.setIsActive(false);
                urlRepository.save(url);
                throw new UrlNotFoundException("URL has expired");
            }

            originalUrl = url.getOriginalUrl();

            long ttlSeconds = Duration.ofDays(1).toSeconds();
            if (url.getExpiresAt() != null) {
                long secondsToExpiry = Duration.between(LocalDateTime.now(), url.getExpiresAt()).toSeconds();
                if (secondsToExpiry > 0) {
                    ttlSeconds = Math.min(ttlSeconds, secondsToExpiry);
                }
            }
            redisTemplate.opsForValue().set(cacheKey, originalUrl, Duration.ofSeconds(ttlSeconds));
        }

        String countKey = "redirect:" + fingerprint;
        Long count = redisTemplate.opsForValue().increment(countKey);

        if (count != null && count == 1) {
            redisTemplate.expire(countKey, Duration.ofMinutes(1));
        }

        if (count != null && count > appProperties.getRedirect().getAbuseThreshold()) {
            redisTemplate.opsForValue().set(blockedKey, "true", Duration.ofMinutes(appProperties.getRedirect().getBlockDuration()));
            throw new TooManyRequestsException("Too many redirect requests.");
        }

        analyticsService.trackClickAsync(shortCode, ip, userAgent, request.getHeader("Referer"));

        return originalUrl;
    }

    private GetAllUrlsResponse mapToResponse(Url url) {
        return GetAllUrlsResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(appProperties.getBaseUrl()+"/"+url.getShortCode())
                .clickCount(url.getClickCount())
                .createdAt(url.getCreatedAt())
                .build();
    }

    private GetUrlResponse mapToGetResponse(Url url) {
        return GetUrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(appProperties.getBaseUrl()+"/"+url.getShortCode())
                .clickCount(url.getClickCount())
                .isActive(url.getIsActive())
                .expiresAt(url.getExpiresAt())
                .createdAt(url.getCreatedAt())
                .username(url.getUser().getUsername())
                .build();
    }

    private String generateUniqueShortCode() {
        String shortCode;
        do {
            shortCode = generateCode();
        } while (urlRepository.existsByShortCode(shortCode));
        return shortCode;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public UrlListResponse getUrlsByUsername(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UserNotFoundException("User not found"));

        Page<Url> urls = urlRepository.findByUserId(user.getId(), pageable);
        List<UrlResponse> list = urls.stream().map(this::mapToUrlResponse).toList();

        return UrlListResponse.builder()
                .urls(list)
                .page(urls.getNumber())
                .size(urls.getSize())
                .totalElements(urls.getTotalElements())
                .totalPages(urls.getTotalPages())
                .last(urls.isLast())
                .build();
    }

    private UrlResponse mapToUrlResponse(Url url) {
        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortUrl(appProperties.getBaseUrl()+"/"+url.getShortCode())
                .isActive(url.getIsActive())
                .createdAt(url.getCreatedAt())
                .updatedAt(url.getUpdatedAt())
                .expiresAt(url.getExpiresAt())
                .build();
    }
}