package com.urlshortener.service;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.urlshortener.exception.LimitExceededException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RateLimiterServiceImpl implements RateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void checkRateLimit(String key, int limit) {

        Long count = redisTemplate.opsForValue()
        .increment(key);

        if (count!=null && count==1) {

            redisTemplate.expire(
                    key,
                    Duration.ofMinutes(1)
            );
        }

        if (count!=null && count>limit) {
            throw new LimitExceededException("Too many requests. Try again later.");
        }
    }
}