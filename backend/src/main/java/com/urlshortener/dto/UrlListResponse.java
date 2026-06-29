package com.urlshortener.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UrlListResponse {

    private List<UrlResponse> urls;

    private int page;
    private int size;

    private long totalElements;
    private int totalPages;

    private boolean last;
}
