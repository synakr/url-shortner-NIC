package com.urlshortener.service;

import com.urlshortener.entity.User;

public interface JwtService {
    
    String generateToken(String username);
    String extractUsername(String token);
    Long extractTokenVersion(String token);
    Boolean isTokenValid(String token, User user);
}