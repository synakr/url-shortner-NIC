package com.urlshortener.service.emailverification;


import com.urlshortener.entity.EmailVerificationPurpose;
import com.urlshortener.entity.User;
import com.urlshortener.exception.*;
import com.urlshortener.repository.UserRepository;
import com.urlshortener.util.TokenHashUtil;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final TokenHashUtil hashUtil;

    private static final Duration TTL = Duration.ofMinutes(15);

    private String buildKey(String email, EmailVerificationPurpose purpose) {
        return "auth:email_verify:" + email + ":" + purpose.name();
    }

    public String generateAndStore(String email, EmailVerificationPurpose purpose, String rawToken) {

        String key = buildKey(email, purpose);
        String hashed = hashUtil.hash(rawToken);

        redisTemplate.opsForValue().set(key, hashed, TTL);

        return rawToken;
    }

    public void validate(String email, String rawToken, EmailVerificationPurpose purpose) {

        String key = buildKey(email, purpose);

        String storedHash = redisTemplate.opsForValue().get(key);

        if (storedHash == null) {
            throw new RuntimeException("Verification expired or not found");
        }

        String incomingHash = hashUtil.hash(rawToken);

        if (!storedHash.equals(incomingHash)) {
            throw new RuntimeException("Invalid verification token");
        }

        redisTemplate.delete(key);
    }
}