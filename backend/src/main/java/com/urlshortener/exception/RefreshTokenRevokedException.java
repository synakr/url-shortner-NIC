package com.urlshortener.exception;

public class RefreshTokenRevokedException extends RuntimeException {
    public RefreshTokenRevokedException() {
        super("Refresh token has been revoked");
    }
}
