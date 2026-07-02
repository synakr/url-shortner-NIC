package com.urlshortener.service;

import com.urlshortener.dto.UserResponse;
import com.urlshortener.entity.User;
import com.urlshortener.exception.UserNotFoundException;
import com.urlshortener.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void activateUser(Long userId) {

        User user = userRepository.findById(userId)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if(user.getIsActive()){
            throw new RuntimeException("User is already active");
        }
        user.setIsActive(true);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {

        User user = userRepository.findById(userId)
        .orElseThrow(()->new UserNotFoundException("User not found"));

        if(!user.getIsActive()){
            throw new RuntimeException("User is already inactive");
        }
        user.setIsActive(false);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }
}
