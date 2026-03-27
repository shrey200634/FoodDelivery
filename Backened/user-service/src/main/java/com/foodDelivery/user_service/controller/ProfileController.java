package com.foodDelivery.user_service.controller;


import com.foodDelivery.user_service.domain.User;
import com.foodDelivery.user_service.service.JwtService;
import com.foodDelivery.user_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        String userId = jwtService.extractUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(profileService.getProfile(userId));
    }
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> updates) {
        String userId = jwtService.extractUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(profileService.updateProfile(userId, updates.get("name"), updates.get("phone")));
    }

}
