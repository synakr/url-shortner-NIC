package com.urlshortener.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.urlshortener.config.AppProperties;
import com.urlshortener.entity.Url;
import com.urlshortener.repository.UrlRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UrlCleanupJob {

    private final UrlRepository urlRepository;
    private final AppProperties appProperties;

    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredUrls() {

        LocalDateTime cutoff = LocalDateTime.now()
        .minusDays(appProperties.getUrl().getGracePeriodDays());

        List<Url> urls = urlRepository.findByIsActiveFalseAndExpiredAtBefore(cutoff);

        urlRepository.deleteAll(urls);
    }
}
