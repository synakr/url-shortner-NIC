package com.urlshortener.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
}
