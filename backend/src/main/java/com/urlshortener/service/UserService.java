package com.urlshortener.service;

import com.urlshortener.dto.ChangePasswordRequest;
import com.urlshortener.dto.ResetPasswordRequest;
import com.urlshortener.dto.ForgotPasswordRequest;
import com.urlshortener.dto.ResetForgotPasswordRequest;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.dto.ChangeEmailRequest;
import com.urlshortener.dto.NewEmailRequest;
import com.urlshortener.dto.UpdateUsernameRequest;
import com.urlshortener.entity.EmailVerificationPurpose;

public interface UserService {
    void register(RegisterRequest request);
    void verifyEmail(String email, String token, EmailVerificationPurpose purpose);
    void requestEmailChange(String username, ChangeEmailRequest request);
    void sendVerificationToNewEmail(NewEmailRequest request);
    void deactivateUser(String username);
    String updateUsername(String username, UpdateUsernameRequest request);
    void requestPasswordChange(String username,ChangePasswordRequest request);
    void confirmPasswordChange(ResetPasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetForgotPassword(ResetForgotPasswordRequest request);
}
