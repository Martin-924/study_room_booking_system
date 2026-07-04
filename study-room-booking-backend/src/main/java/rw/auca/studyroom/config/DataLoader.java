package rw.auca.studyroom.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import rw.auca.studyroom.model.Building;
import rw.auca.studyroom.model.Room;
import rw.auca.studyroom.model.Seat;
import rw.auca.studyroom.model.UserAccount;
import rw.auca.studyroom.model.UserRole;
import rw.auca.studyroom.repository.BuildingRepository;
import rw.auca.studyroom.repository.SeatRepository;
import rw.auca.studyroom.repository.UserAccountRepository;
import rw.auca.studyroom.service.ConfigService;
import rw.auca.studyroom.service.RoomService;
import rw.auca.studyroom.service.UserAccountService;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private RoomService roomService;

    @Autowired
    private ConfigService configService;

    @Override
    public void run(String... args) {
        seedConfig();
        if (userAccountRepository.count() == 0) {
            UserAccount admin = new UserAccount("admin", UserAccountService.DEFAULT_PASSWORD, "系统管理员", UserRole.ADMIN);
            userAccountRepository.save(admin);

            UserAccount student = new UserAccount("2024001", UserAccountService.DEFAULT_PASSWORD, "张同学", UserRole.STUDENT);
            student.setStudentNo("2024001");
            student.setClassName("计算机科学与技术 1 班");
            student.setPhone("13800000001");
            userAccountRepository.save(student);
            System.out.println("Default accounts loaded: admin / 2024001, password 123456");
        }

        if (buildingRepository.count() == 0) {
            // 思明校区 — 图书馆（1-4楼）
            Building simingLib = buildingRepository.save(
                new Building("思明校区", "图书馆", 4, "思明校区图书馆，1-4楼设有自习室"));
            // 翔安校区 — 德旺图书馆（2-6楼）
            Building xiangAnDewang = buildingRepository.save(
                new Building("翔安校区", "德旺图书馆", 6, "翔安校区德旺图书馆，2-6楼设有自习室"));
            // 翔安校区 — 学武楼（负一楼）
            Building xiangAnXuewu = buildingRepository.save(
                new Building("翔安校区", "学武楼", 1, "翔安校区学武楼负一楼自习室"));

            Room siming1f = roomService.createRoom(makeRoom("图书馆一层自习室", simingLib, 1, 4, 6));
            Room siming2f = roomService.createRoom(makeRoom("图书馆二层自习室", simingLib, 2, 4, 6));
            Room siming3f = roomService.createRoom(makeRoom("图书馆三层静音区", simingLib, 3, 5, 8));
            Room siming4f = roomService.createRoom(makeRoom("图书馆四层自习室", simingLib, 4, 4, 6));

            Room dewang2f = roomService.createRoom(makeRoom("德旺图书馆二层自习区", xiangAnDewang, 2, 5, 8));
            Room dewang3f = roomService.createRoom(makeRoom("德旺图书馆三层自习区", xiangAnDewang, 3, 4, 6));
            Room dewang4f = roomService.createRoom(makeRoom("德旺图书馆四层自习区", xiangAnDewang, 4, 4, 6));
            Room dewang5f = roomService.createRoom(makeRoom("德旺图书馆五层自习区", xiangAnDewang, 5, 5, 8));
            Room dewang6f = roomService.createRoom(makeRoom("德旺图书馆六层自习区", xiangAnDewang, 6, 4, 6));

            Room xuewuB1 = roomService.createRoom(makeRoom("学武楼负一楼自习室", xiangAnXuewu, -1, 6, 10));

            // 随机停用几个座位展示停用功能
            disableSeat(siming1f, 1, 1);    // 图书馆1层 01-01
            disableSeat(siming1f, 2, 3);    // 图书馆1层 02-03
            disableSeat(siming3f, 3, 5);    // 图书馆3层 03-05
            disableSeat(dewang2f, 1, 2);    // 德旺2层 01-02
            disableSeat(dewang2f, 4, 6);    // 德旺2层 04-06
            disableSeat(dewang5f, 2, 4);    // 德旺5层 02-04
            disableSeat(xuewuB1, 3, 3);     // 学武楼B1 03-03
            disableSeat(xuewuB1, 5, 7);     // 学武楼B1 05-07
            disableSeat(xuewuB1, 6, 10);    // 学武楼B1 06-10

            System.out.println("厦大校区自习室数据加载完成：思明图书馆 1-4F，德旺图书馆 2-6F，学武楼 B1");
        }
    }

    private Room makeRoom(String name, Building building, int floorNumber, int rowCount, int columnCount) {
        String floorLabel = floorNumber < 0 ? "B" + Math.abs(floorNumber) + "层" : floorNumber + "层";
        String location = building.getCampus() + " / " + building.getName() + " / " + floorLabel;
        Room room = new Room(name, building.getId(), building.getName(), building.getCampus(),
            floorNumber, rowCount, columnCount, location);
        room.setOpenTime("08:00");
        room.setCloseTime("22:00");
        return room;
    }

    private void disableSeat(Room room, int row, int column) {
        seatRepository.findByRoomIdAndRowIndexAndColumnIndex(room.getId(), row, column).ifPresent(seat -> {
            seat.setEnabled(false);
            seatRepository.save(seat);
        });
    }

    private void seedConfig() {
        configService.set("max_bookings_per_day", "3");
        configService.set("check_in_window_minutes", "30");
        configService.set("violation_blacklist_threshold", "3");
        configService.set("no_show_grace_minutes", "30");
        configService.set("checkout_grace_minutes", "30");
    }
}
