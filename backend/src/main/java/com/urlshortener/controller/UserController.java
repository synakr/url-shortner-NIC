package com.urlshortener.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.ChangePasswordRequest;
import com.urlshortener.dto.ResetPasswordRequest;
import com.urlshortener.dto.UpdateUsernameRequest;
import com.urlshortener.dto.UrlListResponse;
import com.urlshortener.service.RateLimiterService;
import com.urlshortener.service.UrlService;
import com.urlshortener.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {
    
    private final RateLimiterService rateLimiterService;
    private final AppProperties appProperties;
    private final UserService userService;
    private final UrlService urlService;

    @GetMapping("/role")
    public String me(Authentication authentication){
        return authentication.getAuthorities().toString();
    }

    @GetMapping("/urls")
    public ResponseEntity<UrlListResponse>getMyUrls(Authentication authentication, @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        String username=authentication.getName();
        return ResponseEntity.ok(urlService.getUrlsByUsername(username, pageable));   //method defined in UserServiceImpl
    }

    @GetMapping("/urls/expired")
    public ResponseEntity<UrlListResponse>getExpiredUrls(Authentication authentication, @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String username = authentication.getName();
        return ResponseEntity.ok(urlService.getExpiredUrlsByUser(username, LocalDateTime.now(), pageable));
    }

    @PatchMapping("/deactivate")
    public ResponseEntity<String> deactivate(Authentication authentication){
        rateLimiterService.checkRateLimit(
            "rate:deactivate:" + authentication.getName(),
            appProperties.getRateLimit().getDeactivateAccount()
        );
        userService.deactivateUser(authentication.getName());     //method defined in UserServiceImpl
        return ResponseEntity.ok(
            "Account deactivated. Login again anytime to reactivate."
        );
    }

    @PatchMapping("/update/username")
    public ResponseEntity<String> updateUsername(@RequestBody UpdateUsernameRequest request,Authentication authentication){
        rateLimiterService.checkRateLimit(
            "rate:update-username:" + authentication.getName(),
            appProperties.getRateLimit().getUpdateUsername()
        );
        userService.updateUsername(authentication.getName(), request);     //method defined in UserServiceImpl

        return ResponseEntity.status(HttpStatus.OK)
        .body("Profile updated. Please login again.");
    }

    @PostMapping("/change-password/request")
    public ResponseEntity<String> requestPasswordChange(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        rateLimiterService.checkRateLimit(
            "rate:change-password:" + authentication.getName(),
            appProperties.getRateLimit().getChangePassword()
        );
        userService.requestPasswordChange(authentication.getName(),request);

        return ResponseEntity.ok("A password change link has been sent to your registered email.");
    }

    @PostMapping("/change-password/confirm")
    public ResponseEntity<String> confirmPasswordChange(@Valid @RequestBody ResetPasswordRequest request) {

        userService.confirmPasswordChange(request);

        return ResponseEntity.ok("Password changed successfully. Please log in again.");
    }


}
