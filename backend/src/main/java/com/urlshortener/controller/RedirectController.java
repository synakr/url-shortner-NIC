package com.urlshortener.controller;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.service.UrlService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/")
public class RedirectController {
    
    public final UrlService urlService;
    @GetMapping("{shortCode}") 
    public ResponseEntity<Void> redirect(@PathVariable String shortCode,HttpServletRequest request){

        String originalUrl=urlService.resolveUrl(shortCode, request); //method defined in UrlServiceImpl
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(originalUrl)).build();
    }
}
