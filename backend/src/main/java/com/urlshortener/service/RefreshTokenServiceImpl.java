package com.urlshortener.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urlshortener.exception.RefreshTokenExpiredException;
import com.urlshortener.exception.RefreshTokenNotFoundException;
import com.urlshortener.exception.RefreshTokenRevokedException;

import java.util.List;
import com.urlshortener.entity.RefreshToken;
import com.urlshortener.entity.User;
import com.urlshortener.repository.RefreshTokenRepository;
import com.urlshortener.util.RefreshTokenGenerator;
import com.urlshortener.util.TokenHashUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHashUtil hashUtil;
    private final RefreshTokenGenerator generator;

    @Value("${security.jwt.refresh-token-expiration-days}")
    private long expirationDays;

    @Override
    public String createRefreshToken(User user, String deviceId, String userAgent, String ipAddress) {

        String rawToken = generator.generate();
        String hashed = hashUtil.hash(rawToken);

        RefreshToken entity = RefreshToken.builder()
                .tokenHash(hashed)
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(expirationDays))
                .revoked(false)
                .deviceId(deviceId)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshTokenRepository.save(entity);

        return rawToken;
    }

    @Override
    public RefreshToken validate(String rawToken) {

        String hashed = hashUtil.hash(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(hashed)
        .orElseThrow(RefreshTokenNotFoundException::new);

        if (token.getRevoked()) {
            throw new RefreshTokenRevokedException();
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RefreshTokenExpiredException();
        }

        return token;
    }

    @Override
    public String rotate(String rawToken) {

        RefreshToken oldToken = validate(rawToken);

        // revoke old
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // create new
        String newRaw = generator.generate();
        String newHash = hashUtil.hash(newRaw);

        RefreshToken newToken = RefreshToken.builder()
                .tokenHash(newHash)
                .user(oldToken.getUser())
                .expiresAt(LocalDateTime.now().plusDays(expirationDays))
                .revoked(false)
                .deviceId(oldToken.getDeviceId())
                .userAgent(oldToken.getUserAgent())
                .ipAddress(oldToken.getIpAddress())
                .build();

        refreshTokenRepository.save(newToken);

        return newRaw;
    }

    @Override
    public void revoke(String rawToken) {

        RefreshToken token = validate(rawToken);

        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    @Override
    public void revokeAll(User user) {
        refreshTokenRepository.findByUser(user)
        .forEach(t->t.setRevoked(true));

        // better: replace with bulk update later
    }
}