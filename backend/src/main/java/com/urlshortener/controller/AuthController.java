package com.urlshortener.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.entity.User;
import com.urlshortener.entity.EmailVerificationPurpose;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.LoginResponse;
import com.urlshortener.dto.LogoutRequest;
import com.urlshortener.dto.ChangeEmailRequest;
import com.urlshortener.dto.NewEmailRequest;
import com.urlshortener.dto.RefreshRequest;
import com.urlshortener.dto.RefreshResponse;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.service.AuthService;
import com.urlshortener.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request){
        userService.register(request);  //method defined in UserServiceImpl
        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String email,@RequestParam String token,@RequestParam EmailVerificationPurpose purpose) {

        userService.verifyEmail(email,token, purpose);

        return ResponseEntity.ok("Email verified successfully.");
    }

    @PostMapping("/change-email/request")
    public ResponseEntity<String> requestEmailChange(@Valid @RequestBody ChangeEmailRequest request, Authentication authentication) {

        userService.requestEmailChange(authentication.getName(),request);
        return ResponseEntity.ok("A verification link has been sent to your current email.");
    }

    @PostMapping("/change-email/send-verification")
    public ResponseEntity<String> sendVerificationToNewEmail(@Valid @RequestBody NewEmailRequest request) {

        userService.sendVerificationToNewEmail(request);
        return ResponseEntity.ok("Verification email sent to your new email address.");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));  //method defined in AuthServiceImpl
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(Authentication authentication) {
        authService.logoutAll(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
