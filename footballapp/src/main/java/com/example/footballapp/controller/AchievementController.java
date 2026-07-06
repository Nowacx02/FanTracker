package com.example.footballapp.controller;

import com.example.footballapp.dto.AchievementDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.Stadium;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.CheckInRepository;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    public AchievementController(CheckInRepository checkInRepository, UserRepository userRepository, MatchRepository matchRepository) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AchievementDto> getUserAchievements(@PathVariable Long userId) {
        List<CheckIn> checkIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId);
        Optional<User> userOpt = userRepository.findById(userId);

        int totalMatches = checkIns.size();

        long uniqueStadiums = checkIns.stream()
                .filter(c -> c.getMatch().getStadium() != null)
                .map(c -> c.getMatch().getStadium().getId())
                .distinct()
                .count();

        Set<Long> uniqueTeamIds = new HashSet<>();
        for (CheckIn c : checkIns) {
            if (c.getMatch().getHomeTeam() != null) {
                uniqueTeamIds.add(c.getMatch().getHomeTeam().getId());
            }
            if (c.getMatch().getAwayTeam() != null) {
                uniqueTeamIds.add(c.getMatch().getAwayTeam().getId());
            }
        }
        int uniqueTeams = uniqueTeamIds.size();

        double distanceTraveled = 0.0;
        if (userOpt.isPresent() && userOpt.get().getFavoriteTeam() != null) {
            User user = userOpt.get();

            Optional<Match> homeMatch = matchRepository.findByHomeTeamId(user.getFavoriteTeam().getId()).stream()
                    .filter(m -> m.getStadium() != null && m.getStadium().getLatitude() != null)
                    .findFirst();

            if (homeMatch.isPresent()) {
                Stadium homeStadium = homeMatch.get().getStadium();
                double homeLat = homeStadium.getLatitude();
                double homeLon = homeStadium.getLongitude();

                for (CheckIn c : checkIns) {
                    Stadium matchStadium = c.getMatch().getStadium();
                    if (matchStadium != null && matchStadium.getLatitude() != null && !matchStadium.getId().equals(homeStadium.getId())) {
                        distanceTraveled += calculateHaversineDistance(homeLat, homeLon, matchStadium.getLatitude(), matchStadium.getLongitude());
                    }
                }
            }
        }

        return ResponseEntity.ok(new AchievementDto(totalMatches, (int) uniqueStadiums, uniqueTeams, distanceTraveled));
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}