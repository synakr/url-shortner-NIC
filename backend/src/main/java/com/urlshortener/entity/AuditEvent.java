package com.urlshortener.entity;

public enum AuditEvent {

    LOGIN_SUCCESS,
    LOGIN_FAILED,

    REGISTER,
    LOGOUT,
    LOGOUT_ALL,

    PASSWORD_RESET,
    PASSWORD_CHANGE,
    FORGOT_PASSWORD_REQUEST,

    EMAIL_CHANGE,

    TOKEN_REFRESH
}
