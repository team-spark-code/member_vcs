package com.example.demo.repository;

import com.example.demo.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    // 파일명으로 검색
    Optional<FileEntity> findByFileName(String fileName);

    // 파일 경로로 검색
    Optional<FileEntity> findByFilePath(String filePath);

    // 파일명에 특정 문자열이 포함된 파일 검색
    List<FileEntity> findByFileNameContaining(String fileName);

    // 생성일시 기준 내림차순 정렬 (uploadedAt 대신 createdAt 사용)
    @Query("SELECT f FROM FileEntity f ORDER BY f.createdAt DESC")
    List<FileEntity> findAllOrderByCreatedAtDesc();

    // 파일 크기 기준으로 검색
    List<FileEntity> findByFileSizeGreaterThan(Long fileSize);

    // 파일 크기 범위로 검색
    List<FileEntity> findByFileSizeBetween(Long minSize, Long maxSize);
}
