package com.urlshortener.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUsernameRequest {

    @NotBlank(message="Username is required")
    @Size(min = 4, max = 50, message = "Username must be 4-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscore")
    String username;

    @NotBlank(message="Password is required")
    String password;
}
