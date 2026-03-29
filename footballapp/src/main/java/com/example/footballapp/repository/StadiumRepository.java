package com.example.footballapp.repository;

import com.example.footballapp.entity.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StadiumRepository extends JpaRepository<Stadium, Long> {
    Optional<Stadium> findByExternalApiId(String externalApiId);
}