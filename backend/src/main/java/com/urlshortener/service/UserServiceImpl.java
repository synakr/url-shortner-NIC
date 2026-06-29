package com.urlshortener.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.urlshortener.config.AppProperties;
import com.urlshortener.dto.ChangePasswordRequest;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.dto.UpdateProfileRequest;
import com.urlshortener.entity.Role;
import com.urlshortener.entity.User;
import com.urlshortener.exception.InvalidPasswordException;
import com.urlshortener.exception.UserAlreadyExistsException;
import com.urlshortener.exception.UserNotFoundException;
import com.urlshortener.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiterService;
    private final AppProperties appProperties;

    @Override
    public void register(RegisterRequest request){
        rateLimiterService.checkRateLimit("rate:register:" + request.getUsername(),appProperties.getRateLimit().getRegister());
        if (userRepository.existsByEmail(request.getEmail())){
            throw new UserAlreadyExistsException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        User user = User.builder()
        .username(request.getUsername())
        .email(request.getEmail())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .role(Role.USER)
        .isActive(true)
        .build();

        userRepository.save(user);
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
    public String updateProfile(String currentUsername, UpdateProfileRequest request) {

        User user=userRepository.findByUsername(currentUsername)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if(!user.getUsername().equals(request.getUsername())
        && userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
            "Username already exists");
        }

        if(!user.getEmail().equals(request.getEmail())
        && userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
            "Email already exists");
        }
        

        if(request.getUsername()!=null)user.setUsername(request.getUsername());
        if(request.getEmail()!=null)user.setEmail(request.getEmail());

        userRepository.save(user);
        return "Profile updated successfully. Please login again.";
    }

    @Override
    @Transactional
    public String changePassword(String username,ChangePasswordRequest request) {

        User user=userRepository.findByUsername(username)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if(!passwordEncoder.matches(request.getCurrentPassword(),user.getPasswordHash())){
            throw new InvalidPasswordException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(),user.getPasswordHash())) {
            throw new InvalidPasswordException("New password must be different");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return "Password changed successfully. Please login again.";
    }
}
