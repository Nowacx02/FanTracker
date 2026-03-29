package com.example.footballapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stadiums")
@Data
@NoArgsConstructor
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;
    private Integer capacity;

    private Double latitude;
    private Double longitude;

    @Column(unique = true)
    private String externalApiId;

    private String imgUrl;
}