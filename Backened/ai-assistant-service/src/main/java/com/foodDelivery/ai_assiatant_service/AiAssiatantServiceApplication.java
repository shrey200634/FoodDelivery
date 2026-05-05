package com.foodDelivery.ai_assiatant_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AiAssiatantServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiAssiatantServiceApplication.class, args);
	}

}
