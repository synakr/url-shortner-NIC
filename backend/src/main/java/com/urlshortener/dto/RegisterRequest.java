package com.urlshortener.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message="Username is required")
    private String username;

    @Email(message="Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min=8, max=14, message="Password must be at least 8 characters and maximum 14 characters")
    @NotBlank(message = "Password is required")
    private String password;
}

