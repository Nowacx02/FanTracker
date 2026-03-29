package com.example.footballapp.controller;

import com.example.footballapp.entity.Team;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.TeamRepository;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public UserController(UserRepository userRepository, TeamRepository teamRepository) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PutMapping("/{userId}/favorite-team/{teamId}")
    public ResponseEntity<?> setFavoriteTeam(@PathVariable Long userId, @PathVariable Long teamId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Team> teamOpt = teamRepository.findById(teamId);

        if (userOpt.isPresent() && teamOpt.isPresent()) {
            User user = userOpt.get();
            user.setFavoriteTeam(teamOpt.get());
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.badRequest().body("Nie znaleziono użytkownika lub drużyny.");
    }
}