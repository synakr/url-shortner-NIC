package com.urlshortener.exception;


public class VerificationTokenExpiredException extends RuntimeException{
    public VerificationTokenExpiredException() {
        super("Refresh token has expired");
    }
}
