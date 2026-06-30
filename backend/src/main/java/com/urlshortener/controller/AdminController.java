package com.urlshortener.controller;

import com.urlshortener.dto.UserResponse;
import com.urlshortener.entity.Role;
import com.urlshortener.entity.User;
import com.urlshortener.exception.UserNotFoundException;
import com.urlshortener.repository.UserRepository;
import com.urlshortener.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(){

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<String> activateUser(
            @PathVariable Long id){

        adminService.activateUser(id);

        return ResponseEntity.ok(
                "User activated successfully"
        );
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(
            @PathVariable Long id){

        User user = userRepository.findById(id)
        .orElseThrow(() ->new UserNotFoundException("User not found"));
        if(user.getRole() == Role.ADMIN){
    throw new RuntimeException(
        "Cannot deactivate an admin account"
            );
        }
        adminService.deactivateUser(id);

        return ResponseEntity.ok(
                "User deactivated successfully"
        );
    }
}