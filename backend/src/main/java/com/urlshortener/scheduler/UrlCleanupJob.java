package com.urlshortener.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.urlshortener.config.AppProperties;
import com.urlshortener.entity.Url;
import com.urlshortener.entity.AuditEvent;
import com.urlshortener.service.AuditService;
import com.urlshortener.repository.UrlRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UrlCleanupJob {

    private final UrlRepository urlRepository;
    private final AppProperties appProperties;
    private final AuditService auditService;

    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredUrls() {

        LocalDateTime cutoff = LocalDateTime.now()
        .minusDays(appProperties.getUrl().getGracePeriodDays());

        List<Url> urls = urlRepository.findByIsActiveFalseAndExpiredAtBefore(cutoff);
        urlRepository.deleteAll(urls);
        for(Url url:urls){
        auditService.log(
            "SYSTEM",                
            "system@urlshortener.com", 
            AuditEvent.URL_DELETED,  
            "0.0.0.0",               
            "Scheduler",             
            "Automatically deleted expired link: " + url.getShortCode() + 
            " (Original: " + url.getOriginalUrl() + ")"
        );
        }
    }
}
