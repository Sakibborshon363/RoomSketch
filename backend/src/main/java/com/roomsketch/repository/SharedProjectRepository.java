package com.roomsketch.repository;

import com.roomsketch.entity.SharedProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SharedProjectRepository extends JpaRepository<SharedProject, UUID> {
    Optional<SharedProject> findByShareTokenAndIsActiveTrue(String shareToken);
    Optional<SharedProject> findByProjectId(UUID projectId);
}
