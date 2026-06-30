package com.urlshortener.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accesstoken;

    private String refreshtoken;

    private String username;

    private String email;

    private String tokenType = "Bearer";
}
