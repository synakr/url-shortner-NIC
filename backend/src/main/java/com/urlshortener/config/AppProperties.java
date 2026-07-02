package com.urlshortener.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String baseUrl;

    private Redirect redirect = new Redirect();
    private Url url = new Url();
    private RateLimit rateLimit = new RateLimit();


    @Getter
    @Setter
    public static class Redirect {
        private int abuseThreshold;
        private int blockDuration;
    }

    @Getter
    @Setter
    public static class Url {
        private int defaultExpiryDays;
        private int maxExpiryDays;
        private int maxActiveUrls;
        private int gracePeriodDays;
        private int defaultExtendDays;
    }


    @Getter
    @Setter
    public static class RateLimit {
        private int shortenUrl;
        private int login;
        private int register;
        private int forgotPassword;
        private int resetPassword;
        private int refresh;
        private int updateUsername;
        private int changePassword;
        private int deactivateAccount;
    }
}