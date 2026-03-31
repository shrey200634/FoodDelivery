package com.foodDelivery.restaurant_service.service;

import com.foodDelivery.restaurant_service.domain.Restaurant;
import com.foodDelivery.restaurant_service.dto.RestaurantRequest;
import com.foodDelivery.restaurant_service.dto.RestaurantResponse;
import com.foodDelivery.restaurant_service.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    //create Res

    public RestaurantResponse createRestaurant(String ownerId , RestaurantRequest restaurantRequest){
        Restaurant restaurant = Restaurant.builder()
                .ownerId(ownerId)
                .name(restaurantRequest.getName())
                .description(restaurantRequest.getDescription())
                .cuisineType(restaurantRequest.getCuisineType())
                .address(restaurantRequest.getAddress())
                .latitude(restaurantRequest.getLatitude())
                .longitude(restaurantRequest.getLongitude())
                .minOrderAmount(restaurantRequest.getMinOrderAmount())
                .openingTime(restaurantRequest.getOpeningTime())
                .closingTime(restaurantRequest.getClosingTime())
                .imageUrl(restaurantRequest.getImageUrl())
                .phone(restaurantRequest.getPhone())
                .build();

        restaurant =restaurantRepository.save(restaurant);
        return  RestaurantResponse.fromEntity(restaurant);
    }

    //--------update Restaruant -----//
    @Transactional
    public RestaurantResponse updateRestaurant(String restaurantId , String ownerId , RestaurantRequest request){
        Restaurant restaurant = getRestaurantEntity(restaurantId);
        validateOwner(restaurant, ownerId);

        if (request.getName() !=null) restaurant.setName(request.getName());
        if (request.getDescription()!=null) restaurant.setDescription(restaurant.getDescription());
        if (restaurant.getCuisineType()!=null ) restaurant.setCuisineType(restaurant.getCuisineType());
        if (restaurant.getAddress()!=null) restaurant.setAddress(restaurant.getAddress());
        if (restaurant.getLatitude()!=null) restaurant.setLatitude(restaurant.getLatitude());
        if (restaurant.getLongitude()!=null) restaurant.setLongitude(restaurant.getLongitude());
        if (request.getMinOrderAmount() != null) restaurant.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getOpeningTime() != null) restaurant.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) restaurant.setClosingTime(request.getClosingTime());
        if (request.getImageUrl() != null) restaurant.setImageUrl(request.getImageUrl());
        if (request.getPhone() != null) restaurant.setPhone(request.getPhone());

        restaurant=restaurantRepository.save(restaurant);
        return RestaurantResponse.fromEntity(restaurant);


    }

    //--------get by id ---------//
    public RestaurantResponse getRestaurant(String restaurantId) {
        return RestaurantResponse.fromEntity(getRestaurantEntity(restaurantId));
    }

    // get my restaurant for owner

    public List<RestaurantResponse> getMyRestaurant(String ownerId ){
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    //search for the restaurant
    public List<RestaurantResponse> search(String keyword){
        return restaurantRepository.searchByKeyword(keyword).stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }



}
