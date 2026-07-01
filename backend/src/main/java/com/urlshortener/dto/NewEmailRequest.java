package com.urlshortener.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewEmailRequest {

    @NotBlank
    private String actionToken;

    @Email
    @NotBlank
    private String newEmail;
}
