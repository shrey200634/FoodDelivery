package com.foodDelivery.order_service.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

     private final StringRedisTemplate redisTemplate;
     private final ObjectMapper objectMapper;

    private static final String CART_PREFIX = "cart:";
    private static final String CART_META_PREFIX = "cart-meta:";
    private static final long CART_TTL_HOURS = 24;
    private static final BigDecimal DEFAULT_DELIVERY_FEE = new BigDecimal("30.00");

    //add item to  cart





}
