package com.urlshortener.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetForgotPasswordRequest {
    private String email;
    private String token;

    private String newPassword;
    private String confirmPassword;
}
