package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message="Username or Email is required")
    private String identifier;   //Username or Email

    

    @NotBlank(message="Password is required")
    private String password;
}
