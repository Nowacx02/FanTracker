package com.example.footballapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponseDto {
    private Long id;
    private Long matchId;
    private String matchTitle;
    private String city;
    private Integer round;
    private LocalDateTime date;
    private String photoUrl;
}