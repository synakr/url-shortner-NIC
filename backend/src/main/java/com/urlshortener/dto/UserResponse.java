package com.urlshortener.dto;

import com.urlshortener.entity.Role;
import com.urlshortener.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Boolean isActive;
    private Role role;

    public static UserResponse from(User user){
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .role(user.getRole())
                .build();
    }
}