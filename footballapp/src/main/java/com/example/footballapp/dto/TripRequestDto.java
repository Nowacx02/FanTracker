package com.example.footballapp.dto;

import lombok.Data;

@Data
public class TripRequestDto {
    private Long matchId;
    private Long organizerId;
    private String meetingPoint;
    private String departureTime;
    private String transportType;
    private Integer availableSeats;
    private String description;
}