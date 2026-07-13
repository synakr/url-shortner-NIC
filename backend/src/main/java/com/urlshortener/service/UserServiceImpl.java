package com.urlshortener.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.ChangePasswordRequest;
import com.urlshortener.dto.ResetPasswordRequest;
import com.urlshortener.dto.ForgotPasswordRequest;
import com.urlshortener.dto.ResetForgotPasswordRequest;
import com.urlshortener.dto.ChangeEmailRequest;
import com.urlshortener.dto.NewEmailRequest;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.dto.UpdateUsernameRequest;
import com.urlshortener.entity.Role;
import com.urlshortener.entity.User;
import com.urlshortener.entity.AuditEvent;
import com.urlshortener.exception.*;
import com.urlshortener.repository.UserRepository;
import com.urlshortener.service.emailverification.EmailService;
import com.urlshortener.entity.EmailVerificationPurpose;
import com.urlshortener.service.emailverification.EmailVerificationService;
import com.urlshortener.util.RefreshTokenGenerator;
import com.urlshortener.util.TokenHashUtil;
import com.urlshortener.util.RequestUtil;

import io.micrometer.core.ipc.http.HttpSender.Request;

import com.urlshortener.util.JsonUtil;
import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final RequestUtil requestUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiterService;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;
    private final AuditService auditService;
    private final JsonUtil JsonUtil;
    private final AppProperties appProperties;
    private final RefreshTokenGenerator tokenGenerator;
    private final TokenHashUtil hashUtil;
    private final RedisTemplate<String, String> redisTemplate;
    private final RefreshTokenService refreshTokenService;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void register(RegisterRequest request){
        rateLimiterService.checkRateLimit("rate:register:" + request.getUsername(),appProperties.getRateLimit().getRegister());
        if (userRepository.existsByEmail(request.getEmail())){
            throw new UserAlreadyExistsException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        System.out.println("LOG: 1. Preparing to generate token");
        String rawToken = tokenGenerator.generate();

        emailVerificationService.generateAndStore(request.getEmail(),EmailVerificationPurpose.REGISTER,rawToken);

        redisTemplate.opsForValue().set(
                "reg:" + request.getEmail(),
                JsonUtil.toJson(request),
                Duration.ofMinutes(30)
        );

        System.out.println("LOG: 2. Attempting to send email to: " + request.getEmail());
    try {
        emailService.sendEmail(
                request.getEmail(),
                "Verify your email",
                buildLink(request.getEmail(), rawToken, "REGISTER")
        );
        System.out.println("LOG: 3. Email service call finished successfully");
    } catch (Exception e) {
        System.err.println("LOG: 3. EMAIL SERVICE CRASHED: " + e.getMessage());
        e.printStackTrace();
    }
        auditService.log(request.getUsername(), request.getEmail(), AuditEvent.REGISTER, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "User registration initiated");
    }

    private String buildLink(String email, String token, String purpose) {
        return UriComponentsBuilder
                .fromUriString(frontendUrl + "/verify-email")
                .queryParam("email", email)
                .queryParam("token", token)
                .queryParam("purpose", purpose)
                .toUriString();
    }

    @Override
    public void verifyEmail(String email, String token, EmailVerificationPurpose purpose) {
        switch (purpose) {
        case REGISTER->verifyRegistration(email, token);
        case EMAIL_CHANGE->confirmEmailChange(email, token);
        default->throw new IllegalArgumentException("Unsupported verification purpose");
        }
    }

    private void verifyRegistration(String email, String token) {

        emailVerificationService.validate(email, token, EmailVerificationPurpose.REGISTER);
        String key = "reg:" + email;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            throw new RuntimeException("Registration expired");
        }
        RegisterRequest request =
                JsonUtil.fromJson(json, RegisterRequest.class);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isActive(true)
                .emailVerified(true)
                .build();

        userRepository.save(user);
        redisTemplate.delete(key);
    }

    @Override
    @Transactional
    public void requestEmailChange(String username, ChangeEmailRequest request) {
        rateLimiterService.checkRateLimit("change-email:" + username,appProperties.getRateLimit().getChangeEmail());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash())) {

            throw new InvalidPasswordException("Incorrect password");
        }

        String rawToken = tokenGenerator.generate();

        String hashed = hashUtil.hash(rawToken);

        redisTemplate.opsForValue().set(
                "auth:email_change_action:" + hashed,
                user.getId().toString(),
                Duration.ofMinutes(15));

        emailService.sendEmail(
                user.getEmail(),
                "Confirm Email Change",
                buildOldEmailLink(rawToken));
    }

    private String buildOldEmailLink(String token) {
        return UriComponentsBuilder
                .fromUriString(frontendUrl + "/change-email")
                .queryParam("token", token)
                .toUriString();
    }

    @Override
    @Transactional
    public void sendVerificationToNewEmail(
            NewEmailRequest request) {

        String hashed =hashUtil.hash(request.getActionToken());

        String value = redisTemplate.opsForValue().get(
                "auth:email_change_action:" + hashed);

        if (value == null) {
            throw new VerificationTokenExpiredException();
        }

        Long userId = Long.valueOf(value);

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new UserAlreadyExistsException(
                    "Email already exists");
        }

        String rawVerification =
                tokenGenerator.generate();

        emailVerificationService.generateAndStore(
                request.getNewEmail(),
                EmailVerificationPurpose.EMAIL_CHANGE,
                rawVerification);

        redisTemplate.opsForValue().set(
                "auth:email_change_verify:"
                        + request.getNewEmail(),
                userId.toString(),
                Duration.ofMinutes(15));

        emailService.sendEmail(
                request.getNewEmail(),
                "Verify your new email",
                buildNewEmailVerificationLink(
                        request.getNewEmail(),
                        rawVerification));

        redisTemplate.delete("auth:email_change_action:" + hashed);
    }

    private String buildNewEmailVerificationLink(String email, String token) {
        return UriComponentsBuilder
                .fromUriString(frontendUrl + "/verify-email")
                .queryParam("email", email)
                .queryParam("token", token)
                .queryParam("purpose", EmailVerificationPurpose.EMAIL_CHANGE)
                .toUriString();
    }

    private void confirmEmailChange(String email,String token) {

        emailVerificationService.validate(email,token,EmailVerificationPurpose.EMAIL_CHANGE);

        String value =redisTemplate.opsForValue().get("auth:email_change_verify:"+ email);

        if (value == null) {
            throw new VerificationTokenExpiredException();
        }

        Long userId = Long.valueOf(value);

        User user = userRepository.findById(userId)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        user.setEmail(email);

        user.setEmailVerified(true);

        userRepository.save(user);

        redisTemplate.delete("auth:email_change_verify:" + email);

        refreshTokenService.revokeAll(user);
    }

    @Override
    public void deactivateUser(String username) {

        User user=userRepository.findByUsername(username)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        user.setIsActive(false);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public String updateUsername(String currentusername, UpdateUsernameRequest request) {

        User user=userRepository.findByUsername(currentusername)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if(!user.getUsername().equals(request.getUsername())
        && userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
            "Username already exists");
        }

        if (!passwordEncoder.matches(request.getPassword(),user.getPasswordHash())) {
            throw new InvalidPasswordException("Password is incorrect");
        }

        if(request.getUsername()!=null)user.setUsername(request.getUsername());

        user.setTokenVersion(user.getTokenVersion() + 1);
        refreshTokenService.revokeAll(user);
        userRepository.save(user);
        return "Username updated successfully. Please login again.";
    }

    @Override
    @Transactional
    public void requestPasswordChange(String username, ChangePasswordRequest request) {

        User user = userRepository.findByUsername(username)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(),user.getPasswordHash())) {
            throw new InvalidPasswordException("Current password is incorrect.");
        }

        String rawToken = tokenGenerator.generate();

        String hashedToken = hashUtil.hash(rawToken);

        redisTemplate.opsForValue().set(
                "auth:password_change:" + hashedToken,
                user.getId().toString(),
                Duration.ofMinutes(15));

        emailService.sendEmail(
                user.getEmail(),
                "Password Change Request",
                buildPasswordChangeLink(rawToken));
    }

    private String buildPasswordChangeLink(String token) {

        return UriComponentsBuilder
                .fromUriString(frontendUrl + "/change-password")
                .queryParam("token", token)
                .toUriString();
    }

    @Override
    @Transactional
    public void confirmPasswordChange(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match.");
        }

        String hashed = hashUtil.hash(request.getActionToken());

        String value = redisTemplate.opsForValue().get(
                "auth:password_change:" + hashed);

        if (value == null) {
            throw new VerificationTokenExpiredException();
        }

        Long userId = Long.valueOf(value);

        User user = userRepository.findById(userId)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if (passwordEncoder.matches(request.getNewPassword(),user.getPasswordHash())) {
            throw new InvalidPasswordException("New password cannot be the same as current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        refreshTokenService.revokeAll(user);
        userRepository.save(user);
        redisTemplate.delete("auth:password_change:" + hashed);
        auditService.log(user.getUsername(), user.getEmail(), AuditEvent.PASSWORD_CHANGE, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "Password changed successfully");
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new UserNotFoundException("User not found"));
        auditService.log(user.getUsername(), user.getEmail(), AuditEvent.FORGOT_PASSWORD_REQUEST, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "Password reset requested");
        String rawToken = tokenGenerator.generate();
        String hashed = hashUtil.hash(rawToken);

        String key = "pwd-reset:" + user.getEmail();

        redisTemplate.opsForValue().set(key, hashed, Duration.ofMinutes(15));

        String link = buildResetLink(request.getEmail(),rawToken);

        emailService.sendEmail(
                user.getEmail(),
                "Reset Password",
                link
        );
    }

    private String buildResetLink(String email, String token) {

        return UriComponentsBuilder
                .fromUriString(frontendUrl + "/reset-password")
                .queryParam("email", email)
                .queryParam("token", token)
                .toUriString();
    }
    
    @Override
    @Transactional
    public void resetForgotPassword(ResetForgotPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Passwords do not match");
        }

        String key = "pwd-reset:" + request.getEmail();

        String storedHash = redisTemplate.opsForValue().get(key);

        if (storedHash == null) {
                throw new RuntimeException("Reset token expired");
        }

        String incomingHash = hashUtil.hash(request.getToken());

        if (!storedHash.equals(incomingHash)) {
                throw new RuntimeException("Invalid reset token");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        // 🔥 SECURITY CRITICAL STEP
        user.setTokenVersion(user.getTokenVersion() + 1);
        refreshTokenService.revokeAll(user);
        userRepository.save(user);
        redisTemplate.delete(key);
        auditService.log(user.getUsername(), user.getEmail(), AuditEvent.PASSWORD_RESET, RequestUtil.getIpAddress(), RequestUtil.getUserAgent(), "Password reset completed");
    }
}
