package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUrlRequest{

    @NotBlank(message = "Original URL is required")

    @Pattern(
        regexp = "^(https?://).+$",
        message = "Please provide a valid URL"
    )
    String originalUrl;

}
