package com.example.footballapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private int totalMatchesAttended = 0;
    private double distanceTraveledKm = 0.0;
    private int earnedBadgesCount = 0;

    @ManyToOne
    @JoinColumn(name = "favorite_team_id")
    private Team favoriteTeam;
}