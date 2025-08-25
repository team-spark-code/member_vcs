package com.example.demo.repository;

import com.example.demo.entity.RawRssItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RawRssItemRepository extends JpaRepository<RawRssItem, String> {

    // 소스별 RSS 아이템 조회 (최신순)
    List<RawRssItem> findBySourceOrderByCollectedAtDesc(String source);

    // 최근 수집된 아이템 조회
    @Query("SELECT r FROM RawRssItem r ORDER BY r.collectedAt DESC")
    List<RawRssItem> findTopByOrderByCollectedAtDesc(@Param("limit") int limit);

    // 특정 기간 내 수집된 아이템 조회
    List<RawRssItem> findByCollectedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // 제목으로 검색
    List<RawRssItem> findByTitleContainingIgnoreCase(String title);

    // 소스와 날짜 범위로 조회
    List<RawRssItem> findBySourceAndCollectedAtBetween(String source, LocalDateTime startDate, LocalDateTime endDate);
}
