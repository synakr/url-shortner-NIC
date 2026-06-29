package com.urlshortener.service;

import com.urlshortener.dto.ChangePasswordRequest;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.dto.UpdateProfileRequest;

public interface UserService {
    void register(RegisterRequest request);
    void deactivateUser(String username);
    String updateProfile(String currentUsername,UpdateProfileRequest request);
    String changePassword(String username,ChangePasswordRequest request);
}
