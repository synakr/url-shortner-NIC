package com.urlshortener.service;

import com.urlshortener.dto.GeoResponse;

public interface GeoService {
    GeoResponse getLocation(String ip);
}
