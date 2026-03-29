package com.example.footballapp.controller;

import com.example.footballapp.dto.LoginRequestDto;
import com.example.footballapp.entity.User;
import com.example.footballapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }

        return ResponseEntity.badRequest().body("Nieprawidłowy login lub hasło");
    }
}