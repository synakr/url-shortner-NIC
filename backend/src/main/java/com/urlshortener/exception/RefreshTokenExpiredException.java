package com.urlshortener.exception;

public class RefreshTokenExpiredException extends RuntimeException {
    public RefreshTokenExpiredException() {
        super("Refresh token has expired");
    }
}
