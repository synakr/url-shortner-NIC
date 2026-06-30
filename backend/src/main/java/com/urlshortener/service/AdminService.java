package com.urlshortener.service;

import com.urlshortener.dto.UserResponse;

import java.util.List;

public interface AdminService {

    List<UserResponse> getAllUsers();

    void activateUser(Long userId);

    void deactivateUser(Long userId);
}
