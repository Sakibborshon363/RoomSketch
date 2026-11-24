package com.roomsketch.repository;

import com.roomsketch.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FloorRepository extends JpaRepository<Floor, UUID> {
    List<Floor> findByProjectIdOrderByFloorNumberAsc(UUID projectId);
    List<Floor> findByProjectIdInOrderByFloorNumberAsc(List<UUID> projectIds);
    Optional<Floor> findByIdAndProjectId(UUID id, UUID projectId);
}
