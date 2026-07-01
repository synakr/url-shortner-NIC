package com.urlshortener.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @Size(min = 4, max = 50, message = "Username must be 4-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscore")
    @NotBlank(message="Username is required")
    private String username;

    @Email(message="Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min=8, max=14, message="Password must be at least 8 characters and maximum 14 characters")
    @NotBlank(message = "Password is required")
    private String password;
}

