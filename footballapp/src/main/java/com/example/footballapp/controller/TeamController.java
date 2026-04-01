package com.example.footballapp.controller;

import com.example.footballapp.entity.Team;
import com.example.footballapp.repository.TeamRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final com.example.footballapp.service.DataImportService dataImportService;

    public TeamController(TeamRepository teamRepository, com.example.footballapp.service.DataImportService dataImportService) {
        this.teamRepository = teamRepository;
        this.dataImportService = dataImportService;
    }

    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll(Sort.by(Sort.Direction.ASC, "leagueRank"));
    }

    @PostMapping
    public Team addTeam(@RequestBody Team team) {
        return teamRepository.save(team);
    }

    @PostMapping("/import-ekstraklasa")
    public String importEkstraklasa() {
        dataImportService.importTeamsFromEkstraklasa();
        return "Import drużyn uruchomiony. Sprawdź konsolę.";
    }

    @PostMapping("/import-table")
    public String importTable(@RequestParam String leagueId, @RequestParam String season) {
        dataImportService.importLeagueTable(leagueId, season);
        return "Import tabeli uruchomiony. Sprawdź konsolę.";
    }
}