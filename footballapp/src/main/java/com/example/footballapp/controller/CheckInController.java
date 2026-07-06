package com.example.footballapp.controller;

import com.example.footballapp.dto.CheckInResponseDto;
import com.example.footballapp.dto.StadiumMapDto;
import com.example.footballapp.dto.UserRankingDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.CheckInRepository;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/checkins")
public class CheckInController {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    private final String UPLOAD_DIR = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath() + "/";

    public CheckInController(CheckInRepository checkInRepository, UserRepository userRepository, MatchRepository matchRepository) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
    }

    @PostMapping
    public ResponseEntity<String> createCheckIn(
            @RequestParam("userId") Long userId,
            @RequestParam("matchId") Long matchId,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Match> matchOpt = matchRepository.findById(matchId);

        if (userOpt.isEmpty() || matchOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Błąd: Nie znaleziono użytkownika lub meczu.");
        }

        User user = userOpt.get();
        Match match = matchOpt.get();

        if (checkInRepository.findByUserAndMatch(user, match).isPresent()) {
            return ResponseEntity.badRequest().body("Błąd: Jesteś już zameldowany na tym meczu!");
        }

        CheckIn checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setMatch(match);
        checkIn.setCheckInTime(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            try {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                checkIn.setPhotoUrl("/uploads/" + fileName);

            } catch (IOException e) {
                return ResponseEntity.status(500).body("Błąd podczas zapisywania zdjęcia. Sprawdź logi.");
            }
        }

        checkInRepository.save(checkIn);
        return ResponseEntity.ok("Sukces! Zameldowano na meczu.");
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> addPhotoToExistingCheckIn(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        Optional<CheckIn> checkInOpt = checkInRepository.findById(id);

        if (checkInOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Błąd: Nie znaleziono zameldowania.");
        }

        CheckIn checkIn = checkInOpt.get();

        if (photo != null && !photo.isEmpty()) {
            try {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                checkIn.setPhotoUrl("/uploads/" + fileName);
                checkInRepository.save(checkIn);

                return ResponseEntity.ok("Pamiątka ze stadionu została pomyślnie dodana!");

            } catch (IOException e) {
                return ResponseEntity.status(500).body("Błąd podczas zapisywania zdjęcia na serwerze.");
            }
        }

        return ResponseEntity.badRequest().body("Nie wybrano pliku.");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCheckInStatus(@RequestParam Long userId, @RequestParam Long matchId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Match> matchOpt = matchRepository.findById(matchId);

        Map<String, Object> response = new HashMap<>();
        response.put("isCheckedIn", false);

        if (userOpt.isPresent() && matchOpt.isPresent()) {
            Optional<CheckIn> checkInOpt = checkInRepository.findByUserAndMatch(userOpt.get(), matchOpt.get());
            if (checkInOpt.isPresent()) {
                response.put("isCheckedIn", true);
                response.put("id", checkInOpt.get().getId());
                response.put("photoUrl", checkInOpt.get().getPhotoUrl());
            }
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CheckInResponseDto>> getUserCheckIns(@PathVariable Long userId) {
        List<CheckIn> checkIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId);

        List<CheckInResponseDto> response = checkIns.stream().map(checkIn -> {
            String title = checkIn.getMatch().getHomeTeam().getName() + " vs " + checkIn.getMatch().getAwayTeam().getName();
            String city = checkIn.getMatch().getHomeTeam().getCity();
            Integer round = checkIn.getMatch().getMatchRound();
            LocalDateTime time = checkIn.getCheckInTime();
            String photoUrl = checkIn.getPhotoUrl();

            return new CheckInResponseDto(checkIn.getId(), checkIn.getMatch().getId(), title, city, round, time, photoUrl);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<UserRankingDto>> getFanRanking() {
        return ResponseEntity.ok(checkInRepository.getTopFans());
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> deletePhoto(@PathVariable Long id) {
        Optional<CheckIn> checkInOpt = checkInRepository.findById(id);
        if (checkInOpt.isPresent()) {
            CheckIn checkIn = checkInOpt.get();
            if (checkIn.getPhotoUrl() != null) {
                try {
                    String fileName = checkIn.getPhotoUrl().replace("/uploads/", "");
                    Path filePath = Paths.get(UPLOAD_DIR + fileName);
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Błąd usuwania pliku: " + e.getMessage());
                }
                checkIn.setPhotoUrl(null);
                checkInRepository.save(checkIn);
                return ResponseEntity.ok("Usunięto zdjęcie");
            }
        }
        return ResponseEntity.badRequest().body("Błąd usuwania zdjęcia");
    }


    @GetMapping("/map/{userId}")
    public ResponseEntity<List<StadiumMapDto>> getUserMapData(@PathVariable Long userId) {
        List<CheckIn> checkIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId);
        Map<Long, StadiumMapDto> mapData = new HashMap<>();

        for (CheckIn c : checkIns) {
            if (c.getMatch().getStadium() == null || c.getMatch().getStadium().getLatitude() == null) continue;

            Long sId = c.getMatch().getStadium().getId();

            if (!mapData.containsKey(sId)) {
                mapData.put(sId, new StadiumMapDto(
                        sId,
                        c.getMatch().getStadium().getName(),
                        c.getMatch().getStadium().getCity(),
                        c.getMatch().getStadium().getLatitude(),
                        c.getMatch().getStadium().getLongitude(),
                        c.getPhotoUrl(),
                        c.getPhotoUrl() != null ? 1 : 0
                ));
            } else {
                StadiumMapDto dto = mapData.get(sId);
                if (c.getPhotoUrl() != null) {
                    dto.setTotalPhotos(dto.getTotalPhotos() + 1);
                }
            }
        }
        return ResponseEntity.ok(new ArrayList<>(mapData.values()));
    }

    @GetMapping("/user/{userId}/stadium/{stadiumId}/photos")
    public ResponseEntity<List<String>> getStadiumPhotos(@PathVariable Long userId, @PathVariable Long stadiumId) {
        List<CheckIn> checkIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(userId);
        List<String> photos = checkIns.stream()
                .filter(c -> c.getMatch().getStadium() != null && c.getMatch().getStadium().getId().equals(stadiumId))
                .map(CheckIn::getPhotoUrl)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return ResponseEntity.ok(photos);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCheckIn(@PathVariable Long id) {
        Optional<CheckIn> checkInOpt = checkInRepository.findById(id);
        if (checkInOpt.isPresent()) {
            CheckIn checkIn = checkInOpt.get();
            if (checkIn.getPhotoUrl() != null) {
                try {
                    String fileName = checkIn.getPhotoUrl().replace("/uploads/", "");
                    Path filePath = Paths.get(UPLOAD_DIR + fileName);
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println(e.getMessage());
                }
            }
            checkInRepository.delete(checkIn);
            return ResponseEntity.ok("Pomyślnie wymeldowano z meczu.");
        }
        return ResponseEntity.badRequest().body("Błąd podczas wymeldowywania.");
    }

}