package rw.auca.studyroom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.auca.studyroom.model.UserAccount;
import rw.auca.studyroom.service.UserAccountService;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserAccountController {

    @Autowired
    private UserAccountService userAccountService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userAccountService.getAllUsers().stream()
            .map(userAccountService::toPublicMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserAccount user) {
        try {
            UserAccount savedUser = userAccountService.createUser(user);
            return new ResponseEntity<>(userAccountService.toPublicMap(savedUser), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UserAccount user) {
        try {
            UserAccount updatedUser = userAccountService.updateUser(id, user);
            return ResponseEntity.ok(userAccountService.toPublicMap(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        return userAccountService.deleteUser(id)
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id) {
        try {
            UserAccount user = userAccountService.resetPassword(id);
            return ResponseEntity.ok(userAccountService.toPublicMap(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/blacklist")
    public ResponseEntity<?> blacklist(@PathVariable UUID id, @RequestBody Map<String, Boolean> request) {
        try {
            UserAccount user = userAccountService.setBlacklist(id, Boolean.TRUE.equals(request.get("blacklisted")));
            return ResponseEntity.ok(userAccountService.toPublicMap(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
