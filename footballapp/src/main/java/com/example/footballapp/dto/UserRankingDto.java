package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRankingDto {
    private String username;
    private Long checkInCount;
    private Long uniqueStadiumsCount;
}