package com.example.footballapp.controller;

import com.example.footballapp.dto.AwayStatsDto;
import com.example.footballapp.dto.UserRankingDto;
import com.example.footballapp.entity.CheckIn;
import com.example.footballapp.entity.Friendship;
import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.CheckInRepository;
import com.example.footballapp.repository.FriendshipRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final CheckInRepository checkInRepository;

    public FriendshipController(FriendshipRepository friendshipRepository, UserRepository userRepository, CheckInRepository checkInRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.checkInRepository = checkInRepository;
    }

    @PostMapping("/request")
    public ResponseEntity<String> sendRequest(@RequestParam Long requesterId, @RequestParam String receiverUsername) {
        Optional<User> requesterOpt = userRepository.findById(requesterId);
        Optional<User> receiverOpt = userRepository.findByUsername(receiverUsername);

        if (requesterOpt.isEmpty() || receiverOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie znaleziono użytkownika o podanej nazwie.");
        }

        User requester = requesterOpt.get();
        User receiver = receiverOpt.get();

        if (requester.getId().equals(receiver.getId())) {
            return ResponseEntity.badRequest().body("Nie możesz wysłać zaproszenia do samego siebie.");
        }

        Optional<Friendship> existingOpt = friendshipRepository.findByUsers(requester, receiver);
        if (existingOpt.isPresent()) {
            Friendship existing = existingOpt.get();
            if (existing.getStatus().equals("PENDING")) {
                return ResponseEntity.badRequest().body("Zaproszenie zostało już wysłane.");
            } else if (existing.getStatus().equals("ACCEPTED")) {
                return ResponseEntity.badRequest().body("Jesteście już znajomymi.");
            }
        }

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);
        friendship.setStatus("PENDING");
        friendshipRepository.save(friendship);

        return ResponseEntity.ok("Zaproszenie zostało pomyślnie wysłane.");
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Friendship> requests = friendshipRepository.findByReceiverAndStatus(userOpt.get(), "PENDING");
        List<Map<String, Object>> response = requests.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("friendshipId", f.getId());
            map.put("requesterUsername", f.getRequester().getUsername());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/respond")
    public ResponseEntity<String> respondToRequest(@RequestParam Long friendshipId, @RequestParam String action) {
        Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
        if (fOpt.isPresent()) {
            Friendship f = fOpt.get();
            if (action.equals("ACCEPT")) {
                f.setStatus("ACCEPTED");
                friendshipRepository.save(f);
                return ResponseEntity.ok("Zaakceptowano zaproszenie.");
            } else if (action.equals("REJECT")) {
                friendshipRepository.delete(f);
                return ResponseEntity.ok("Odrzucono zaproszenie.");
            }
        }
        return ResponseEntity.badRequest().body("Błąd operacji.");
    }

    @GetMapping("/ranking/{userId}")
    public ResponseEntity<List<UserRankingDto>> getFriendsRanking(@PathVariable Long userId) {
        return ResponseEntity.ok(checkInRepository.getFriendsRanking(userId));
    }

    @GetMapping("/away-stats/{userId}")
    public ResponseEntity<List<AwayStatsDto>> getAwayStats(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || userOpt.get().getFavoriteTeam() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        User currentUser = userOpt.get();
        Long favTeamId = currentUser.getFavoriteTeam().getId();
        String favTeamName = currentUser.getFavoriteTeam().getName();

        List<UserRankingDto> friends = checkInRepository.getFriendsRanking(userId);
        List<String> validUsernames = friends.stream()
                .filter(f -> f.getFavoriteTeamName() != null && f.getFavoriteTeamName().equals(favTeamName))
                .map(UserRankingDto::getUsername)
                .toList();

        List<AwayStatsDto> stats = new ArrayList<>();

        for (String username : validUsernames) {
            Optional<User> uOpt = userRepository.findByUsername(username);
            if (uOpt.isEmpty()) continue;
            User u = uOpt.get();

            List<CheckIn> userCheckIns = checkInRepository.findByUserIdOrderByCheckInTimeDesc(u.getId());

            int w = 0, d = 0, l = 0, total = 0;

            for (CheckIn c : userCheckIns) {
                Match m = c.getMatch();
                if (m.getAwayTeam() != null && m.getAwayTeam().getId().equals(favTeamId)) {
                    if (m.getHomeGoals() != null && m.getAwayGoals() != null) {
                        total++;
                        if (m.getAwayGoals() > m.getHomeGoals()) w++;
                        else if (m.getAwayGoals().equals(m.getHomeGoals())) d++;
                        else l++;
                    }
                }
            }

            double winPct = total > 0 ? Math.round(((double) w / total) * 10000.0) / 100.0 : 0.0;
            stats.add(new AwayStatsDto(username, total, w, d, l, winPct));
        }

        // Sortowanie pechowca: najniższy win %, a w przypadku remisu -> kto ma więcej przegranych
        stats.sort((a, b) -> {
            int cmp = Double.compare(a.getWinPercentage(), b.getWinPercentage());
            if (cmp != 0) return cmp;
            return Integer.compare(b.getLosses(), a.getLosses());
        });

        return ResponseEntity.ok(stats);
    }
}