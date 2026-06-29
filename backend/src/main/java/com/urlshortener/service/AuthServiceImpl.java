package com.urlshortener.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;
import com.urlshortener.entity.User;
import com.urlshortener.exception.InvalidPasswordException;
import com.urlshortener.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
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

        return LoginResponse.builder()
        .token(token)
        .username(user.getUsername())
        .email(user.getEmail())
        .build();
    }
}
