package com.example.demo.repository;

import com.example.demo.entity.JsonlData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JsonlDataRepository extends JpaRepository<JsonlData, Long> {

    // GUID로 중복 체크
    Optional<JsonlData> findByGuid(String guid);

    // 소스별 데이터 조회
    List<JsonlData> findBySource(String source);

    // 작성자별 데이터 조회
    List<JsonlData> findByAuthor(String author);

    // 제목으로 검색
    @Query("SELECT j FROM JsonlData j WHERE j.title LIKE %:keyword%")
    List<JsonlData> findByTitleContaining(@Param("keyword") String keyword);

    // 설명으로 검색
    @Query("SELECT j FROM JsonlData j WHERE j.description LIKE %:keyword%")
    List<JsonlData> findByDescriptionContaining(@Param("keyword") String keyword);

    // 전체 검색
    @Query("SELECT j FROM JsonlData j WHERE j.title LIKE %:keyword% OR j.description LIKE %:keyword% OR j.author LIKE %:keyword%")
    List<JsonlData> findByKeyword(@Param("keyword") String keyword);
}
