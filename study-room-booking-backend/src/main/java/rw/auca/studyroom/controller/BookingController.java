package rw.auca.studyroom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.auca.studyroom.model.Booking;
import rw.auca.studyroom.service.BookingService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, String> request) {
        try {
            Booking savedBooking = bookingService.createBooking(request);
            if (savedBooking != null) {
                return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("座位不可预约");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable UUID userId) {
        return new ResponseEntity<>(bookingService.getBookingsByUser(userId), HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable UUID id) {
        try {
            boolean deleted = bookingService.cancelBooking(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBookingByPut(@PathVariable UUID id) {
        return cancelBooking(id);
    }
    
    @PutMapping("/{bookingId}")
    public ResponseEntity<Booking> releaseBooking(@PathVariable UUID bookingId) {
        Booking updatedBooking = bookingService.releaseBooking(bookingId);
        if (updatedBooking != null) {
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{bookingId}/release")
    public ResponseEntity<Booking> releaseBookingExplicit(@PathVariable UUID bookingId) {
        return releaseBooking(bookingId);
    }

    @PutMapping("/{bookingId}/check-in")
    public ResponseEntity<?> checkInBooking(@PathVariable UUID bookingId) {
        try {
            return new ResponseEntity<>(bookingService.checkInBooking(bookingId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/check-out")
    public ResponseEntity<?> checkOutBooking(@PathVariable UUID bookingId) {
        try {
            return new ResponseEntity<>(bookingService.checkOutBooking(bookingId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/no-show")
    public ResponseEntity<?> markNoShow(@PathVariable UUID bookingId) {
        try {
            return new ResponseEntity<>(bookingService.markNoShow(bookingId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
