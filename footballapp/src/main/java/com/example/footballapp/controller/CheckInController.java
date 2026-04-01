package com.example.footballapp.controller;

import com.example.footballapp.dto.CheckInResponseDto;
import com.example.footballapp.dto.UserRankingDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.CheckInRepository;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/checkins")
public class CheckInController {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    public CheckInController(CheckInRepository checkInRepository, UserRepository userRepository, MatchRepository matchRepository) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
    }

    @PostMapping
    public ResponseEntity<String> createCheckIn(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long matchId = request.get("matchId");

        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Match> matchOpt = matchRepository.findById(matchId);

        if (userOpt.isEmpty() || matchOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Błąd: Nie znaleziono użytkownika lub meczu w bazie.");
        }

        User user = userOpt.get();
        Match match = matchOpt.get();

        if (checkInRepository.findByUserAndMatch(user, match).isPresent()) {
            return ResponseEntity.badRequest().body("Błąd: Ten kibic jest już zameldowany na tym meczu!");
        }

        CheckIn checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setMatch(match);
        checkIn.setCheckInTime(LocalDateTime.now());

        checkInRepository.save(checkIn);

        return ResponseEntity.ok("Sukces! Zameldowano na mecz: " + match.getHomeTeam().getName() + " vs " + match.getAwayTeam().getName());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CheckInResponseDto>> getUserCheckIns(@PathVariable Long userId) {

        List<CheckIn> checkIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId);

        List<CheckInResponseDto> response = checkIns.stream().map(checkIn -> {
            String title = checkIn.getMatch().getHomeTeam().getName() + " vs " + checkIn.getMatch().getAwayTeam().getName();
            String city = checkIn.getMatch().getHomeTeam().getCity();
            Integer round = checkIn.getMatch().getMatchRound();
            LocalDateTime time = checkIn.getCheckInTime();

            return new CheckInResponseDto(title, city, round, time);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<UserRankingDto>> getFanRanking() {
        return ResponseEntity.ok(checkInRepository.getTopFans());
    }
}