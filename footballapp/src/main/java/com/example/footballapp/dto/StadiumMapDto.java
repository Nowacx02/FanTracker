package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StadiumMapDto {
    private Long stadiumId;
    private String stadiumName;
    private String city;
    private Double latitude;
    private Double longitude;
    private String latestPhotoUrl;
    private int totalPhotos;
}