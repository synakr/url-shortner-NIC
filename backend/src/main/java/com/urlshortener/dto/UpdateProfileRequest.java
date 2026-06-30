package com.urlshortener.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    String username;

    @Email(message="Invalid email")
    String email;
}
