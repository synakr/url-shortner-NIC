package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    private String actionToken;

    @NotBlank
    @Size(min = 8, max = 14)
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
