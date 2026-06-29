package com.urlshortener.service;

import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
