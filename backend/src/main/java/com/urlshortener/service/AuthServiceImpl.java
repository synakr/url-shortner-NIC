package com.urlshortener.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urlshortener.config.AppProperties;
import com.urlshortener.util.RequestUtil;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;
import com.urlshortener.dto.RefreshResponse;
import com.urlshortener.entity.User;
import com.urlshortener.entity.AuditEvent;
import com.urlshortener.entity.RefreshToken;
import com.urlshortener.exception.InvalidPasswordException;
import com.urlshortener.exception.UserNotFoundException;
import com.urlshortener.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final RateLimiterService rateLimiterService;
    private final AuditService auditService;
    private final AppProperties appProperties;
    private final RequestUtil requestUtil;

    @Override
    public LoginResponse login(LoginRequest request) {

        rateLimiterService.checkRateLimit("rate:login:" + request.getUsername(),appProperties.getRateLimit().getLogin());

        try{
            User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(()->new RuntimeException("User not found"));

            if (!user.getIsActive()) {
                user.setIsActive(true);
                userRepository.save(user);
            }
            
            if (!passwordEncoder.matches(request.getPassword(),user.getPasswordHash())) {
                auditService.log(request.getUsername(), user.getEmail(), AuditEvent.LOGIN_FAILED, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "Incorrect password");
                throw new InvalidPasswordException(
                "Current password is incorrect");
            }

            String token = jwtService.generateToken(user.getUsername());
            String refreshToken = refreshTokenService.createRefreshToken(user, null, null, null);
            auditService.log(user.getUsername(), user.getEmail(), AuditEvent.LOGIN_SUCCESS, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "Login successful");
            return LoginResponse.builder()
            .accesstoken(token)
            .refreshtoken(refreshToken)
            .username(user.getUsername())
            .tokenType("Bearer")
            .email(user.getEmail())
            .build();
        } catch (Exception e) {
            auditService.log(request.getUsername(), "unknown", AuditEvent.LOGIN_FAILED, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), e.getMessage());
            throw e;
        }

    }

    @Override
    @Transactional
    public RefreshResponse refresh(String rawRefreshToken) {
        RefreshToken token = refreshTokenService.validate(rawRefreshToken);
        rateLimiterService.checkRateLimit(
            "rate:refresh:" + token,
            appProperties.getRateLimit().getRefresh()
        );

        User user = token.getUser();

        if (!user.getIsActive()) {
            throw new UserNotFoundException("User disabled");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new InvalidPasswordException("Email not verified");
        }

        String newRefreshToken =refreshTokenService.rotate(rawRefreshToken);

        String newAccessToken =jwtService.generateToken(user.getUsername());

        return RefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
        RefreshToken token=refreshTokenService.validate(refreshToken);
        auditService.log(token.getUser().getUsername(), token.getUser().getEmail(), AuditEvent.LOGOUT, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "User logged out");
    }

    @Override
    public void logoutAll(String username) {
        User user = userRepository.findByUsername(username)
        .orElseThrow(()->new UserNotFoundException("User not found"));
        refreshTokenService.revokeAll(user);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
        auditService.log(user.getUsername(), user.getEmail(), AuditEvent.LOGOUT_ALL, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "All sessions revoked");
    }
}
