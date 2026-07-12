package rw.auca.studyroom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusRoomReservationApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusRoomReservationApplication.class, args);
    }
}
