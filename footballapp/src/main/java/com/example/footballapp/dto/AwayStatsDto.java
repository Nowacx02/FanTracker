package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwayStatsDto {
    private String username;
    private int matchesAttended;
    private int wins;
    private int draws;
    private int losses;
    private double winPercentage;
}