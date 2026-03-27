package com.foodDelivery.restaurant_service.domain;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "categories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String categoryId;


}
