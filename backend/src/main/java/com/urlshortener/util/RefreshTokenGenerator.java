package com.urlshortener.util;

import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.stereotype.Component;

@Component
public class RefreshTokenGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final int TOKEN_SIZE = 32; // 256 bits

    public String generate() {

        byte[] randomBytes = new byte[TOKEN_SIZE];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }
}