package com.example.footballapp.service;

import com.example.footballapp.entity.Match;
import com.example.footballapp.entity.Team;
import com.example.footballapp.repository.MatchRepository;
import com.example.footballapp.repository.StadiumRepository;
import com.example.footballapp.repository.TeamRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.example.footballapp.entity.Stadium;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class DataImportService {

    private final SportsDbClient sportsDbClient;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final StadiumRepository stadiumRepository;
    private final ObjectMapper objectMapper;

    public DataImportService(SportsDbClient sportsDbClient,
                             TeamRepository teamRepository,
                             MatchRepository matchRepository,
                             StadiumRepository stadiumRepository) {
        this.sportsDbClient = sportsDbClient;
        this.teamRepository = teamRepository;
        this.matchRepository = matchRepository;
        this.stadiumRepository = stadiumRepository;
        this.objectMapper = new ObjectMapper();
    }

    //IMPORT DRUŻYN
    public void importTeamsFromEkstraklasa() {
        try {
            String json = sportsDbClient.getAllTeams("Polish Ekstraklasa");
            JsonNode root = objectMapper.readTree(json);
            JsonNode teamsNode = root.get("teams");

            if (teamsNode == null || teamsNode.isNull()) {
                System.out.println("Nie znaleziono drużyn!");
                return;
            }

            for (JsonNode teamNode : teamsNode) {
                String externalId = teamNode.path("idTeam").asText();
                String teamName = teamNode.path("strTeam").asText();
                String league = teamNode.path("strLeague").asText();
                String city = teamNode.path("strLocation").asText();
                String badgeUrl = teamNode.path("strBadge").asText("");

                if (!externalId.isBlank()) {
                    if (teamRepository.findByExternalApiId(externalId).isEmpty()) {
                        Team team = new Team();
                        team.setExternalApiId(externalId);
                        team.setName(teamName);
                        team.setLeague(league);
                        team.setCity(city);
                        team.setBadgeUrl(badgeUrl);

                        teamRepository.save(team);
                        System.out.println("Zapisano nową drużynę: " + teamName + " (ID: " + externalId + ")");
                    } else {
                        System.out.println("Pominięto, drużyna już istnieje: " + teamName);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Błąd podczas importu drużyn: " + e.getMessage());
        }
    }


    public void importMatchesForRound(String season, String round) {
        try {
            // Pobieramy konkretną kolejkę (4422 to Ekstraklasa)
            String json = sportsDbClient.getRoundMatches("4422", season, round);
            JsonNode root = objectMapper.readTree(json);
            JsonNode events = root.get("events");

            if (events == null || events.isNull()) {
                System.out.println("Nie znaleziono meczów dla sezonu: " + season + ", kolejka: " + round);
                return;
            }

            for (JsonNode event : events) {
                String idEvent = event.path("idEvent").asText();
                String idHomeTeam = event.path("idHomeTeam").asText();
                String idAwayTeam = event.path("idAwayTeam").asText();
                String idVenue = event.path("idVenue").asText(""); // Pobieramy ID stadionu
                String dateStr = event.path("dateEvent").asText();
                String timeStr = event.path("strTime").asText();
                int intRound = event.path("intRound").asInt();

                if (matchRepository.findByExternalApiId(idEvent).isEmpty()) {

                    Optional<Team> homeTeamOpt = teamRepository.findByExternalApiId(idHomeTeam);
                    Optional<Team> awayTeamOpt = teamRepository.findByExternalApiId(idAwayTeam);

                    if (homeTeamOpt.isPresent() && awayTeamOpt.isPresent()) {
                        Match match = new Match();
                        match.setExternalApiId(idEvent);
                        match.setMatchRound(intRound);
                        match.setHomeTeam(homeTeamOpt.get());
                        match.setAwayTeam(awayTeamOpt.get());

                        // --- NOWA LOGIKA DLA STADIONU ---
                        if (!idVenue.isBlank() && !idVenue.equals("null")) {
                            Optional<Stadium> stadiumOpt = stadiumRepository.findByExternalApiId(idVenue);

                            if (stadiumOpt.isPresent()) {
                                // Mamy już ten stadion, po prostu go przypinamy
                                match.setStadium(stadiumOpt.get());
                            } else {
                                // Nie mamy stadionu, więc pytamy API
                                String venueJson = sportsDbClient.getVenueDetails(idVenue);
                                JsonNode venueRoot = objectMapper.readTree(venueJson);
                                JsonNode venuesNode = venueRoot.get("venues");

                                if (venuesNode != null && !venuesNode.isNull() && venuesNode.isArray()) {
                                    JsonNode venueNode = venuesNode.get(0); // Pobieramy pierwszy (i jedyny) wynik

                                    Stadium stadium = new Stadium();
                                    stadium.setExternalApiId(idVenue);
                                    stadium.setName(venueNode.path("strVenue").asText("Nieznany Stadion"));
                                    stadium.setCity(venueNode.path("strLocation").asText(""));
                                    stadium.setCapacity(venueNode.path("intCapacity").asInt(0));
                                    stadium.setImgUrl(venueNode.path("strThumb").asText(null));

                                    String strMap = venueNode.path("strMap").asText("");

                                    if (!strMap.isBlank() && strMap.contains(",")) {
                                        try {
                                            String[] cords = strMap.split(",");

                                            // trim() usuwa ewentualne spacje przed i po liczbie
                                            stadium.setLatitude(Double.parseDouble(cords[0].trim()));
                                            stadium.setLongitude(Double.parseDouble(cords[1].trim()));
                                        } catch (Exception e) {
                                            System.out.println("Ostrzeżenie: Błędny format GPS dla stadionu " + stadium.getName());
                                        }
                                    }

                                    // Niektóre obiekty API nie mają współrzędnych, więc te pola mogą pozostać puste w bazie
                                    stadiumRepository.save(stadium);

                                    match.setStadium(stadium);
                                    System.out.println("Zapisano nowy stadion: " + stadium.getName());
                                }
                            }
                        }
                        // --- KONIEC LOGIKI STADIONU ---

                        LocalDate matchDate = LocalDate.parse(dateStr);
                        LocalTime matchTime = timeStr.isBlank() ? LocalTime.of(20, 0) : LocalTime.parse(timeStr);
                        match.setMatchDate(LocalDateTime.of(matchDate, matchTime));

                        if (!event.path("intHomeScore").isNull()) {
                            match.setHomeGoals(event.path("intHomeScore").asInt());
                            match.setAwayGoals(event.path("intAwayScore").asInt());
                        }

                        String videoUrl = event.path("strVideo").asText(null);
                        if (videoUrl != null && !videoUrl.isBlank()) {
                            match.setVideoUrl(videoUrl);
                        }

                        matchRepository.save(match);
                        System.out.println("Zapisano mecz: " + homeTeamOpt.get().getName() + " vs " + awayTeamOpt.get().getName());
                    } else {
                        System.out.println("Pominięto. Brak drużyny w bazie dla meczu ID: " + idEvent);
                    }
                } else {
                    System.out.println("Pominięto, mecz już istnieje (ID: " + idEvent + ")");
                }
            }
        } catch (Exception e) {
            System.err.println("Błąd podczas importu kolejki: " + e.getMessage());
        }
    }

    // --- NOWA METODA: Import tabeli ligowej ---
    public void importLeagueTable(String leagueId, String season) {
        try {
            String json = sportsDbClient.getLeagueTable(leagueId, season);
            JsonNode root = objectMapper.readTree(json);
            JsonNode tableNode = root.get("table");

            if (tableNode == null || tableNode.isNull()) {
                System.out.println("Nie znaleziono tabeli dla ligi: " + leagueId + " sezon: " + season);
                return;
            }

            for (JsonNode teamStatNode : tableNode) {
                String externalTeamId = teamStatNode.path("idTeam").asText();

                // Szukamy drużyny w naszej bazie
                Optional<Team> teamOpt = teamRepository.findByExternalApiId(externalTeamId);

                if (teamOpt.isPresent()) {
                    Team team = teamOpt.get();

                    // Aktualizujemy statystyki
                    team.setLeagueRank(teamStatNode.path("intRank").asInt());
                    team.setRankDescription(teamStatNode.path("strDescription").asText(""));
                    team.setMatchesPlayed(teamStatNode.path("intPlayed").asInt());
                    team.setWins(teamStatNode.path("intWin").asInt());
                    team.setDraws(teamStatNode.path("intDraw").asInt());
                    team.setLosses(teamStatNode.path("intLoss").asInt());
                    team.setGoalsFor(teamStatNode.path("intGoalsFor").asInt());
                    team.setGoalsAgainst(teamStatNode.path("intGoalsAgainst").asInt());
                    team.setGoalDifference(teamStatNode.path("intGoalDifference").asInt());
                    team.setPoints(teamStatNode.path("intPoints").asInt());

                    teamRepository.save(team);
                    System.out.println("Zaktualizowano tabelę dla: " + team.getName() + " - Pozycja: " + team.getLeagueRank());
                } else {
                    System.out.println("Pominięto drużynę, której nie ma w bazie (ID: " + externalTeamId + ")");
                }
            }
        } catch (Exception e) {
            System.err.println("Błąd podczas importu tabeli ligowej: " + e.getMessage());
        }
    }
}