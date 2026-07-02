package com.urlshortener.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.dto.CreateUrlRequest;
import com.urlshortener.dto.UpdateUrlRequest;
import com.urlshortener.dto.GetAllUrlsResponse;
import com.urlshortener.dto.GetUrlResponse;
import com.urlshortener.dto.UrlResponse;
import com.urlshortener.service.UrlService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {
    private final UrlService urlService;

    @PostMapping("/urls")
    public ResponseEntity<GetAllUrlsResponse>shortenUrl(@Valid @RequestBody CreateUrlRequest request, Authentication authentication) {
        return ResponseEntity.ok(
            urlService.shortenUrl(request,authentication.getName())   //method defined in UrlServiceImpl
        );
    }

    @GetMapping("/urls/{shortCode}")
    public ResponseEntity<GetUrlResponse> getOriginalUrl(@PathVariable String shortCode){
        return ResponseEntity.ok(
                urlService.getOriginalUrl(shortCode)    //method defined in UrlServiceImpl
        );
    }

    @PatchMapping("/urls/{id}/deactivate")
    public ResponseEntity<String> deactivate(@PathVariable Long id, Authentication authentication){
        urlService.deactivateUrl(id,authentication.getName());   //method defined in UrlServiceImpl
        return ResponseEntity.ok(
                "User deactivated successfully"
        );
    }

    @PatchMapping("/urls/{id}/activate")
    public ResponseEntity<String> activate(@PathVariable Long id,Authentication authentication){
        urlService.activateUrl(id,authentication.getName());    //method defined in UrlServiceImpl
        return ResponseEntity.ok(
                "User activated successfully"
        );
    }

    @PatchMapping("/urls/{id}")
    public ResponseEntity<UrlResponse> updateUrl(@PathVariable Long id, @Valid @RequestBody UpdateUrlRequest request, Authentication authentication) {

        UrlResponse response = urlService.updateUrl(id,request,authentication.getName());
        return ResponseEntity.ok(response);
    }
}
