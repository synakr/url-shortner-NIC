package com.urlshortener.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.urlshortener.repository.UrlRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UrlDeactivtateJob {

    private final UrlRepository urlRepository;

    // @Scheduled(cron="0 */5 * * * *")  
    @Transactional
    protected void deactivateExpiredUrls(){
        int count = urlRepository.deactivateExpiredUrls(LocalDateTime.now());
        if(count>0){
            System.out.println("Deactivated "+count+ " expired urls");
        }
    }  
    
}
