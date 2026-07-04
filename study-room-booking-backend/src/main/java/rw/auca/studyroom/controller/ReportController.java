package rw.auca.studyroom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.auca.studyroom.service.ReportService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(reportService.getOverview());
    }

    @GetMapping("/room-usage")
    public ResponseEntity<List<Map<String, Object>>> getRoomUsage(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(reportService.getRoomUsage(date));
    }

    @GetMapping("/time-slots")
    public ResponseEntity<List<Map<String, Object>>> getTimeSlotStats(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(reportService.getTimeSlotStats(date));
    }

    @GetMapping("/no-show-stats")
    public ResponseEntity<Map<String, Object>> getNoShowStats() {
        return ResponseEntity.ok(reportService.getNoShowStats());
    }
}
