package com.urlshortener.repository;

import com.urlshortener.entity.Url;
import com.urlshortener.entity.User;

import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    Optional<Url> findById(Long id);

    boolean existsByShortCode(String shortCode);

    List<Url> findByUserId(Long userId);
    @Query("""
    SELECT u
    FROM Url u
    WHERE u.user.id = :userId
      AND u.expiresAt > :now
    """)
    Page<Url> findByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);
    Page<Url> findByUserUsernameOrderByClickCountDesc(String username, Pageable pageable);
    Long countByUserId(Long userId);
    Long countByUserAndIsActiveTrue(User user);
    Long countByUserAndIsActiveFalse(User user);
    @Query("""
        SELECT COALESCE(SUM(u.clickCount),0)
        FROM Url u
        WHERE u.user = :user
    """)
    Long getTotalClicks(User user);
	Optional<Url> findByOriginalUrl(String originalUrl);
    Optional<Url> findByIdAndUserUsername(Long Id,String username);
    Optional<Url> findByUserIdAndOriginalUrl(Long userId,String originalUrl);
    Long countByUserIdAndIsActiveTrue(Long userId);

    List<Url> findByIsActiveFalseAndExpiredAtBefore(LocalDateTime cutoff);
    @Modifying
    @Transactional
    @Query("""
    UPDATE Url u
    SET u.isActive = false,
    u.expiredAt = :now
    WHERE u.isActive = true
    AND u.expiresAt <= :now
    """)
    int deactivateExpiredUrls(@Param("now") LocalDateTime now);

    @Query("""
    SELECT u
    FROM Url u
    WHERE u.user.id = :userId
      AND u.isActive = false
      AND u.expiresAt <= :now
    """)
    Page<Url> findExpiredUrlsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);
}
