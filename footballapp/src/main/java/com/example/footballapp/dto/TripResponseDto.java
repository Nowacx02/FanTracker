package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponseDto {
    private Long id;
    private String matchTitle;
    private String organizerName;
    private String meetingPoint;
    private LocalDateTime departureTime;
    private String transportType;
    private Integer maxSeats;
    private Integer occupiedSeats;
    private String description;
    private List<String> participantNames;
    private boolean isCurrentUserJoined;
}