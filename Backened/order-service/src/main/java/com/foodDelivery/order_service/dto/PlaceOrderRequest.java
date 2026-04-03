package com.foodDelivery.order_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotBlank(message = "Deliver address id is required")
    private String deliveryAddressId;


    private String deliverAddress;
    private String specialInstructions;
}
