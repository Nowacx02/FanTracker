package com.example.footballapp.repository;

import com.example.footballapp.dto.UserRankingDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    Optional<CheckIn> findByUserAndMatch(User user, Match match);

    @EntityGraph(attributePaths = {"match", "match.homeTeam", "match.awayTeam", "match.stadium"})
    List<CheckIn> findByUserIdOrderByCheckInTimeDesc(Long userId);

    @Query("SELECT new com.example.footballapp.dto.UserRankingDto(" +
            "c.user.username, " +
            "COUNT(c), " +
            "COUNT(DISTINCT c.match.homeTeam), " +
            "t.name, " +
            "t.badgeUrl) " +
            "FROM CheckIn c " +
            "LEFT JOIN c.user.favoriteTeam t " +
            "GROUP BY c.user.username, t.name, t.badgeUrl " +
            "ORDER BY COUNT(c) DESC")
    List<UserRankingDto> getTopFans();

    @Query("SELECT new com.example.footballapp.dto.UserRankingDto(" +
            "u.username, " +
            "COUNT(c), " +
            "COUNT(DISTINCT c.match.homeTeam), " +
            "t.name, " +
            "t.badgeUrl) " +
            "FROM User u LEFT JOIN CheckIn c ON u = c.user " +
            "LEFT JOIN u.favoriteTeam t " +
            "WHERE u.id IN (SELECT f.requester.id FROM Friendship f WHERE f.receiver.id = :userId AND f.status = 'ACCEPTED') " +
            "   OR u.id IN (SELECT f.receiver.id FROM Friendship f WHERE f.requester.id = :userId AND f.status = 'ACCEPTED') " +
            "   OR u.id = :userId " +
            "GROUP BY u.username, t.name, t.badgeUrl " +
            "ORDER BY COUNT(c) DESC")
    List<UserRankingDto> getFriendsRanking(Long userId);
}