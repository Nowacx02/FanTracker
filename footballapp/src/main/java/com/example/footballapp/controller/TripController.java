package com.example.footballapp.controller;

import com.example.footballapp.dto.TripRequestDto;
import com.example.footballapp.dto.TripResponseDto;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.Trip;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.repository.TripRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    public TripController(TripRepository tripRepository, MatchRepository matchRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<TripResponseDto>> getAllTrips(@RequestParam Long userId) {
        List<Trip> trips = tripRepository.findAllByOrderByDepartureTimeAsc();

        List<TripResponseDto> response = trips.stream().map(trip -> {
            boolean isJoined = trip.getParticipants().stream().anyMatch(u -> u.getId().equals(userId)) || trip.getOrganizer().getId().equals(userId);

            List<String> participantNames = new java.util.ArrayList<>();
            participantNames.add(trip.getOrganizer().getUsername() + " (Organizator)");
            participantNames.addAll(trip.getParticipants().stream().map(User::getUsername).collect(Collectors.toList()));

            String matchTitle = trip.getMatch().getHomeTeam().getName() + " vs " + trip.getMatch().getAwayTeam().getName();

            return new TripResponseDto(
                    trip.getId(),
                    matchTitle,
                    trip.getOrganizer().getUsername(),
                    trip.getMeetingPoint(),
                    trip.getDepartureTime(),
                    trip.getTransportType(),
                    trip.getAvailableSeats(),
                    trip.getParticipants().size() + 1,
                    trip.getDescription(),
                    participantNames,
                    isJoined
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequestDto request) {
        Optional<Match> matchOpt = matchRepository.findById(request.getMatchId());
        Optional<User> orgOpt = userRepository.findById(request.getOrganizerId());

        if (matchOpt.isEmpty() || orgOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie znaleziono meczu lub użytkownika.");
        }

        Trip trip = new Trip();
        trip.setMatch(matchOpt.get());
        trip.setOrganizer(orgOpt.get());
        trip.setMeetingPoint(request.getMeetingPoint());
        trip.setDepartureTime(LocalDateTime.parse(request.getDepartureTime()));
        trip.setTransportType(request.getTransportType());
        trip.setAvailableSeats(request.getAvailableSeats());
        trip.setDescription(request.getDescription());

        tripRepository.save(trip);
        return ResponseEntity.ok("Wyjazd został pomyślnie zorganizowany!");
    }

    @PostMapping("/{tripId}/join")
    public ResponseEntity<?> joinTrip(@PathVariable Long tripId, @RequestParam Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (tripOpt.isPresent() && userOpt.isPresent()) {
            Trip trip = tripOpt.get();
            User user = userOpt.get();

            if (trip.getOrganizer().getId().equals(userId) || trip.getParticipants().contains(user)) {
                return ResponseEntity.badRequest().body("Już bierzesz udział w tym wyjeździe.");
            }

            if (trip.getParticipants().size() >= trip.getAvailableSeats()) {
                return ResponseEntity.badRequest().body("Brak wolnych miejsc w tym wyjeździe.");
            }

            trip.getParticipants().add(user);
            tripRepository.save(trip);
            return ResponseEntity.ok("Pomyślnie dołączono do wyjazdu!");
        }
        return ResponseEntity.badRequest().body("Błąd podczas dołączania.");
    }

    @PostMapping("/{tripId}/leave")
    public ResponseEntity<?> leaveTrip(@PathVariable Long tripId, @RequestParam Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (tripOpt.isPresent() && userOpt.isPresent()) {
            Trip trip = tripOpt.get();
            User user = userOpt.get();

            if (trip.getOrganizer().getId().equals(userId)) {
                return ResponseEntity.badRequest().body("Organizator nie może opuścić własnego wyjazdu. Usuń wydarzenie.");
            }

            trip.getParticipants().remove(user);
            tripRepository.save(trip);
            return ResponseEntity.ok("Opuszczono wyjazd.");
        }
        return ResponseEntity.badRequest().body("Błąd operacji.");
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, @RequestParam Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);

        if (tripOpt.isPresent()) {
            Trip trip = tripOpt.get();
            if (!trip.getOrganizer().getId().equals(userId)) {
                return ResponseEntity.badRequest().body("Tylko organizator może usunąć ten wyjazd.");
            }
            tripRepository.delete(trip);
            return ResponseEntity.ok("Wyjazd został pomyślnie usunięty.");
        }
        return ResponseEntity.badRequest().body("Nie znaleziono wyjazdu.");
    }
}