package com.urlshortener.service;

public interface RateLimiterService {
    void checkRateLimit(String key, int limit);
}
