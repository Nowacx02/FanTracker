package com.example.footballapp.repository;

import com.example.footballapp.dto.UserRankingDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    Optional<CheckIn> findByUserAndMatch(User user, Match match);

    List<CheckIn> findByUserIdOrderByCheckInTimeDesc(Long userId);

    @Query("SELECT new com.example.footballapp.dto.UserRankingDto(" +
                  "c.user.username, " +
                  "COUNT(c), " +
                  "COUNT(DISTINCT c.match.homeTeam)) " +
                  "FROM CheckIn c " +
                  "GROUP BY c.user.username " +
                  "ORDER BY COUNT(c) DESC")
    List<UserRankingDto> getTopFans();
}