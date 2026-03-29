package com.example.footballapp.controller;

import com.example.footballapp.entity.Match;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.service.DataImportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchRepository matchRepository;
    private final DataImportService dataImportService;

    public MatchController(MatchRepository matchRepository, DataImportService dataImportService) {
        this.matchRepository = matchRepository;
        this.dataImportService = dataImportService;
    }

    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @PostMapping
    public Match addMatch(@RequestBody Match match) {
        return matchRepository.save(match);
    }

    @PostMapping("/import-round")
    public String importRound(
            @RequestParam(defaultValue = "2025-2026") String season,
            @RequestParam(defaultValue = "1") String round) {

        dataImportService.importMatchesForRound(season, round);
        return "Import meczów uruchomiony dla sezonu " + season + ", kolejka " + round + ". Sprawdź konsolę.";
    }
}