package com.example.footballapp.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class SportsDbClient {

    private static final String BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
    private final RestClient restClient;

    public SportsDbClient() {
        this.restClient = RestClient.builder().baseUrl(BASE_URL).build();
    }

    // Metoda do pobierania drużyn
    public String getAllTeams(String leagueName) {
        return restClient.get()
                .uri("/search_all_teams.php?l={league}", leagueName)
                .retrieve()
                .body(String.class);
    }

    public String getRoundMatches(String leagueId, String season, String round) {
        return restClient.get()
                .uri("/eventsround.php?id={id}&r={round}&s={season}", leagueId, round, season)
                .retrieve()
                .body(String.class);
    }

    public String getVenueDetails(String venueId) {
        return restClient.get()
                .uri("/lookupvenue.php?id={id}", venueId)
                .retrieve()
                .body(String.class);
    }

    // --- NOWA METODA: Pobieranie tabeli ligowej ---
    public String getLeagueTable(String leagueId, String season) {
        return restClient.get()
                .uri("/lookuptable.php?l={leagueId}&s={season}", leagueId, season)
                .retrieve()
                .body(String.class);
    }
}