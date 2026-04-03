package com.foodDelivery.order_service.service;

import com.foodDelivery.order_service.domain.Order;
import com.foodDelivery.order_service.domain.OrderItem;
import com.foodDelivery.order_service.dto.*;
import com.foodDelivery.order_service.kafka.OrderEventProducer;
import com.foodDelivery.order_service.repository.OrderRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
   private final OrderRepo orderRepo;
   private final CartService cartService;
   private  final OrderEventProducer orderEventProducer;

   // place and order

    @Transactional
    public OrderResponse placeOrder(String userId , PlaceOrderRequest request){

        // get current cart
        CartResponse cart = cartService.getCart(userId);
        if (cart.getItem()==null || cart.getItem().isEmpty()){
            throw new RuntimeException("Cart is empty. Add items before placing an order.");
        }

        // create order entity
        Order order = Order.builder()
                .userId(userId)
                .restaurantId(cart.getRestaurantId())
                .restaurantName(cart.getRestaurantName())
                .deliveryAddressId(request.getDeliveryAddressId())
                .deliverAddress(request.getDeliverAddress())
                .subTotal(cart.getSubTotal())
                .deliveryFee(cart.getDeliveryFee())
                .totalAmount(cart.getTotal())
                .specialInstructions(request.getSpecialInstructions())
                .estimatedDeliveryMins(30)
                .build();
        // convert cart item to order item
        List<OrderItem>   orderItems = cart.getItem().stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .menuItemId(cartItem.getMenuItemId())
                        .menuItemName(cartItem.getMenuItemName())
                        .quantity(cartItem.getQuantity())
                        .unitPrice(cartItem.getUnitPrice())
                        .totalPrice(cartItem.getTotalPrice())
                        .addedByUserId(userId)
                        .build()
                ).toList();

        order.setItems(orderItems);

        //save to mysql
        Order savedOrder = orderRepo.save(order);
        log.info("Order placed: orderId={}, userId={}, restaurant={}, total={}",
                savedOrder.getOrderId(), userId, cart.getRestaurantName(), cart.getTotal());

        //produce to kafka
        try {
           orderEventProducer.sendOrderPlaced(OrderPlacedEvent.builder()
                           .orderId(savedOrder.getOrderId())
                           .userId(userId)
                           .restaurantId(cart.getRestaurantId())
                           .restaurantName(cart.getRestaurantName())
                           .totalAmount(cart.getTotal())
                           .deliveryAddress(request.getDeliverAddress())
                           .specialInstructions(request.getSpecialInstructions())
                           .placedAt(savedOrder.getCreatedAt())
                           .build());


        } catch (Exception ex ){
            log.warn("Failed to publish order-placed event (Kafka may not be running): {}", ex.getMessage());
        }

        //clear the cart
        cartService.clearCart(userId);

        return OrderResponse.fromEntity(savedOrder);

    }

    // get order by ordeerId

    public OrderResponse gwtOrder(String orderId ){

        Order order =getOrderEntity(orderId);
        return OrderResponse.fromEntity(order);
    }


    //get my order (userhistory )
    public List<OrderResponse> getMyOrder(String userId){
        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    //get order for the restaurant

    public List<OrderResponse> getRestaurantOwner(String resId){
        return orderRepo.findByRestaurantIdOrderByCreatedAtDesc(resId).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    //get active order for thew restaurant
    public List<OrderResponse> getActiveRestaurantOrders(String restaurantId ){
        List<Order.OrderStatus> activeStatuses = List.of(
                Order.OrderStatus.CREATED,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY
        );
        return orderRepo.findActiveOrdersForRestaurant(restaurantId,activeStatuses).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    //update Order status
    @Transactional
    public OrderResponse updateStatus(String orderId , UpdateStatusRequest request){
        Order order=getOrderEntity(orderId);

        Order.OrderStatus newStatus= Order.OrderStatus.valueOf(request.getStatus().toUpperCase());

        //order state machine to validate transition
        order.transitionTo(newStatus);
        //update optional feild
        if (request.getDriverId()!= null){
            order.setDriverId(request.getDriverId());
        }
        if (request.getEstimatedMins()!=null){
            order.setEstimatedDeliveryMins(request.getEstimatedMins());
        }

        Order savedOrder = orderRepo.save(order);
        log.info("Order {} status changed to {}", orderId, newStatus);

        return OrderResponse.fromEntity(savedOrder);
    }














    public Order getOrderEntity(String orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

}
