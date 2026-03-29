package com.example.footballapp.service;

import com.example.footballapp.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalApiService {

    private final TeamRepository teamRepository;
    private final RestTemplate restTemplate;

    public ExternalApiService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
        this.restTemplate = new RestTemplate();
    }

    // Tu napiszemy metodę pobierającą dane z:
    // https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Polish%20Ekstraklasa
}