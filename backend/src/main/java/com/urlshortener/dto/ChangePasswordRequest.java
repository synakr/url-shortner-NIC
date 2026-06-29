package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank
    private String currentPassword;
    @NotBlank(message = "Please enter new password")
    @Size(min=8, max=14, message="Password must be at least 8 characters and maximum 14 characters")@Size(min=6, max=14, message = "Password must be 6-14 characters")
    private String newPassword;
}