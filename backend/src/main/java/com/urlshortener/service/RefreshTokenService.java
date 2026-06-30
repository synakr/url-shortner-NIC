package com.urlshortener.service;

import com.urlshortener.entity.User;
import com.urlshortener.entity.RefreshToken;

public interface RefreshTokenService {

    String createRefreshToken(User user, String deviceId, String userAgent, String ipAddress);

    RefreshToken validate(String rawToken);

    String rotate(String rawToken);

    void revoke(String rawToken);

    void revokeAll(User user);
}
