package com.urlshortener.service;

import com.urlshortener.entity.User;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;
import com.urlshortener.dto.RefreshResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    RefreshResponse refresh(String refreshToken);
    void logout(String refreshToken);
    void logoutAll(String username);
}
