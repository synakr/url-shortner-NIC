package com.urlshortener.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.urlshortener.dto.GeoResponse;
import com.urlshortener.dto.IpInfoResponse;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class GeoServiceImpl implements GeoService {

    private final RestTemplate restTemplate;

    @Value("${ipinfo.token}")
    private String token;

    @Override
    public GeoResponse getLocation(String ip) {

        String url="https://ipinfo.io/"+ip+"?token="+token;

        IpInfoResponse response =
                restTemplate.getForObject(url,IpInfoResponse.class);
        if (response == null) {
            return new GeoResponse("Unknown", "Unknown");
        }
        return new GeoResponse(response.getCountry(),response.getCity());
    }
}