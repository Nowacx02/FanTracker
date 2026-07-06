package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDto {
    private int totalMatches;
    private int uniqueStadiums;
    private int uniqueTeams;
    private double distanceTraveled;
}