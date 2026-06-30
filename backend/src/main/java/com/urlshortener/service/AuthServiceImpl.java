package com.urlshortener.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;
import com.urlshortener.dto.RefreshResponse;
import com.urlshortener.entity.User;
import com.urlshortener.entity.RefreshToken;
import com.urlshortener.exception.InvalidPasswordException;
import com.urlshortener.exception.RefreshTokenNotFoundException;
import com.urlshortener.repository.RefreshTokenRepository;
import com.urlshortener.repository.UserRepository;
import com.urlshortener.util.TokenHashUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHashUtil hashUtil;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final RateLimiterService rateLimiterService;
    private final AppProperties appProperties;

    @Override
    public LoginResponse login(LoginRequest request) {

        rateLimiterService.checkRateLimit("rate:login:" + request.getUsername(),appProperties.getRateLimit().getLogin());

        User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(()->new RuntimeException("User not found"));

        if (!user.getIsActive()) {
            user.setIsActive(true);
            userRepository.save(user);
        }
        
        if (!passwordEncoder.matches(request.getPassword(),user.getPasswordHash())) {
            throw new InvalidPasswordException(
            "Current password is incorrect");
        }

        String token = jwtService.generateToken(user.getUsername());
        String refreshToken = refreshTokenService.createRefreshToken(user, null, null, null);

        return LoginResponse.builder()
        .accesstoken(token)
        .refreshtoken(refreshToken)
        .username(user.getUsername())
        .email(user.getEmail())
        .build();
    }

    @Override
    public RefreshResponse refresh(String refreshToken) {

        RefreshToken token = refreshTokenService.validate(refreshToken);

        String newRefreshToken = refreshTokenService.rotate(refreshToken);

        String newAccessToken = jwtService.generateToken(token.getUser().getUsername());

        return RefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }
}
