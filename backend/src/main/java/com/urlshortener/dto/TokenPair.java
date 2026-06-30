package com.urlshortener.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenPair {

    private String accessToken;
    private String refreshToken;
}
