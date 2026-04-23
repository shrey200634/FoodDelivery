package com.foodDelivery.order_service.kafka;

import com.foodDelivery.order_service.domain.Order;
import com.foodDelivery.order_service.dto.DeliveryCompletedEvent;
import com.foodDelivery.order_service.dto.DeliveryPickedUpEvent;
import com.foodDelivery.order_service.dto.DriverAssignedEvent;
import com.foodDelivery.order_service.repository.OrderRepo;
import com.foodDelivery.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class DeliveryEventConsumer {

    private final OrderService orderService;
    private final OrderRepo orderRepository;

    @KafkaListener(topics = "driver-assigned", groupId = "order-service-group")
    public void handleDriverAssigned(DriverAssignedEvent event) {
        log.info("Received driver-assigned for orderId={}", event.getOrderId());
        try {
            Optional<Order> orderOpt = orderRepository.findById(event.getOrderId());
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setDriverId(event.getDriverId());
                if (event.getEstimatedMins() != null) {
                    order.setEstimatedDeliveryMins(event.getEstimatedMins());
                }
                orderRepository.save(order);
                log.info("Updated order {} with driverId={}", event.getOrderId(), event.getDriverId());
            }
        } catch (Exception ex) {
            log.error("Failed to process driver-assigned: {}", ex.getMessage());
        }
    }

    @KafkaListener(topics = "delivery-picked-up", groupId = "order-service-group")
    public void handleDeliveryPickedUp(DeliveryPickedUpEvent event) {
        log.info("Received delivery-picked-up for orderId={}", event.getOrderId());
        try {
            Order order = orderService.getOrderEntity(event.getOrderId());
            order.transitionTo(Order.OrderStatus.PICKED_UP);
            orderRepository.save(order);
            log.info("Updated order {} status to PICKED_UP", event.getOrderId());
        } catch (Exception ex) {
            log.error("Failed to process delivery-picked-up: {}", ex.getMessage());
        }
    }

    @KafkaListener(topics = "delivery-completed", groupId = "order-service-group")
    public void handleDeliveryCompleted(DeliveryCompletedEvent event) {
        log.info("Received delivery-completed for orderId={}", event.getOrderId());
        try {
            Order order = orderService.getOrderEntity(event.getOrderId());
            order.transitionTo(Order.OrderStatus.DELIVERED);
            orderRepository.save(order);
            log.info("Updated order {} status to DELIVERED", event.getOrderId());
        } catch (Exception ex) {
            log.error("Failed to process delivery-completed: {}", ex.getMessage());
        }
    }
}
