package com.foodDelivery.order_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemRequest {

    @NotBlank(message = "Menu item ID is required ")
    private String menuItemId;
    @NotBlank(message = "Menu item name is required")
    private String menuItemName ;

    @NotBlank(message = "price is required")
    @Positive
    private BigDecimal unitPrice;

    @NotBlank(message = "quantity is required")
    @Min(1)
    private Integer quantity;

    @NotBlank(message = "restaurant id is required")
    private String restaurantId;
    private String restaurantName ;
}
