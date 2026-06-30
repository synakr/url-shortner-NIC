package com.urlshortener.repository;

import com.urlshortener.entity.ClickAnalytics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClickAnalyticsRepository extends JpaRepository<ClickAnalytics, Long> {

    Page<ClickAnalytics> findByUrl_Id(Long urlId, Pageable pageable);

    long countByUrlId(Long urlId);
}