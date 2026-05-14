package iuh.labbooking.configuration.init;

import iuh.labbooking.enums.GroupType;
import iuh.labbooking.enums.MemberRole;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "init.enabled", havingValue = "true", matchIfMissing = true)
public class AppDataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final LecturerProfileRepository lecturerProfileRepository;
    private final ResearchGroupRepository researchGroupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final LabRoomRepository labRoomRepository;
    private final SlotRepository slotRepository;
    private final DeviceRepository deviceRepository;
    private final LabRoomDeviceRepository labRoomDeviceRepository;
    private final AttendanceSystemConfigRepository attendanceConfigRepo;
    private final BookingSystemConfigRepository bookingConfigRepo;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Value("${init.admin.username:admin}")
    private String adminUsername;

    @Value("${init.admin.email:admin@labbooking.local}")
    private String adminEmail;

    @Value("${init.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${init.admin.fullName:System Administrator}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        log.info("========== Starting Application Data Initialization ==========");

        // 0. Initialize System Configurations
        initializeAttendanceConfig();
        initializeBookingConfig();

        // 1. Drop outdated check constraints on status columns
        try {
            entityManager.createNativeQuery(
                            "ALTER TABLE booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check")
                    .executeUpdate();
            entityManager.createNativeQuery(
                            "ALTER TABLE group_join_requests DROP CONSTRAINT IF EXISTS group_join_requests_status_check")
                    .executeUpdate();
            log.info("Dropped outdated check constraints on status columns");
        } catch (Exception e) {
            log.warn("Could not drop outdated check constraints: {}", e.getMessage());
        }

        // 2. Initialize Roles
        Role adminRole = initRole("ADMIN", "System administrator with full access");
        Role lecturerRole = initRole("LECTURER", "Lecturer with lab management permissions");
        Role studentRole = initRole("STUDENT", "Student with booking permissions");

        // 3. Initialize Admin
        initUser(adminUsername, adminEmail, adminPassword, adminFullName, adminRole, null, null);

        // 4. Initialize Lecturers (5 lecturers)
        User[] lecturers = new User[5];
        String[] lectNames = {"Dr. Nguyễn Văn A", "Dr. Trần Thị B", "Dr. Phạm Văn C", "Dr. Lê Thị D",
                "PhD. Đỗ Văn E"};
        for (int i = 0; i < 5; i++) {
            String username = String.format("00%06d", 100001 + i);
            lecturers[i] = initLecturer(username, username + "@iuh.edu.vn", "123123", lectNames[i],
                    lecturerRole, "MSG" + username, "Khoa CNTT", "Bộ môn Công nghệ");
        }

        // 5. Initialize Students (20 students)
        User[] students = new User[20];
        for (int i = 0; i < 20; i++) {
            String id = String.valueOf(22000000 + i + 1);
            students[i] = initStudent(id, id + "@student.iuh.edu.vn", "123123", "Sinh viên " + (i + 1),
                    studentRole, id, "DHKTPM18" + (i % 3 == 0 ? "A" : "B"), "Khoa CNTT",
                    "Kỹ thuật phần mềm");
        }

        // 6. Initialize Research Groups (8 groups)
        ResearchGroup[] groups = new ResearchGroup[8];
        String[] groupNames = {
                "IoT Research Lab", "AI & Healthcare", "Cloud Systems", "Cyber Security",
                "Data Analytics", "Mobile App Dev", "Blockchain Tech", "Robotics & Automation"
        };
        for (int i = 0; i < 8; i++) {
            User creator = lecturers[i % 5];
            groups[i] = initResearchGroup(groupNames[i],
                    "Nghiên cứu về " + groupNames[i],
                    "Project " + groupNames[i],
                    GroupType.RESEARCH,
                    i % 2 == 0,
                    creator);
            initMembership(groups[i], creator, MemberRole.LEADER);
        }

        // 7. Initialize Group Memberships
        // Student 1 (index 0) belongs to first 5 groups
        for (int i = 0; i < 5; i++) {
            initMembership(groups[i], students[0], MemberRole.MEMBER);
        }

        // Distribute other students to groups
        for (int i = 1; i < 20; i++) {
            int groupIdx = (i - 1) % 8;
            initMembership(groups[groupIdx], students[i], MemberRole.MEMBER);
        }

        // 8. Initialize Lab Rooms
        initLabRoom("H9.3", "H building", 40, 10.7765, 106.7009);
        initLabRoom("H3.3", "H building", 35, 10.7765, 106.7009);
        initLabRoom("A1.1", "A building", 50, 10.7765, 106.7009);

        // 9. Initialize Slots
        initSlot("Ca 1", "06:30", "09:00", "Ca sáng 1");
        initSlot("Ca 2", "09:00", "11:30", "Ca sáng 2");
        initSlot("Ca 3", "12:30", "15:00", "Ca chiều 1");
        initSlot("Ca 4", "15:00", "17:30", "Ca chiều 2");
        initSlot("Ca 5", "18:00", "20:30", "Ca tối");

        // 10. Initialize Devices
        Device osc = initDevice("Oscilloscope", "Electronic", "Waves");
        Device dmm = initDevice("Digital Multimeter", "Electronic", "Zap");
        Device sol = initDevice("Soldering Station", "Tool", "Pocket");
        Device pc = initDevice("Desktop PC", "Computer", "Monitor");
        Device plc = initDevice("PLC Training Kit", "Automation", "Cpu");

        // 11. Assign Devices to Lab Rooms
        LabRoom h93 = labRoomRepository.findByRoomName("H9.3").orElse(null);
        LabRoom h33 = labRoomRepository.findByRoomName("H3.3").orElse(null);
        LabRoom a11 = labRoomRepository.findByRoomName("A1.1").orElse(null);

        if (h93 != null) {
            initLabRoomDevice(h93, osc, 10);
            initLabRoomDevice(h93, dmm, 15);
            initLabRoomDevice(h93, pc, 20);
        }

        if (h33 != null) {
            initLabRoomDevice(h33, sol, 12);
            initLabRoomDevice(h33, dmm, 8);
            initLabRoomDevice(h33, pc, 15);
        }

        if (a11 != null) {
            initLabRoomDevice(a11, plc, 5);
            initLabRoomDevice(a11, pc, 25);
        }

        log.info("========== Application Data Initialization Completed ==========");
    }

    private Role initRole(String roleName, String description) {
        return roleRepository.findByRoleName(roleName)
                .map(existingRole -> {
                    log.debug("Role '{}' already exists", roleName);
                    return existingRole;
                })
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .roleName(roleName)
                            .description(description)
                            .build();
                    Role savedRole = roleRepository.save(newRole);
                    log.info("Created role: {} - {}", roleName, description);
                    return savedRole;
                });
    }

    private User initUser(String username, String email, String password, String fullName, Role role,
                          String department,
                          String faculty) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(username)
                            .fullName(fullName)
                            .passwordHash(passwordEncoder.encode(password))
                            .iuhEmail(email)
                            .role(role)
                            .department(department)
                            .faculty(faculty)
                            .dob(LocalDate.of(2000, 1, 1))
                            .phone("09" + (int) (Math.random() * 100000000))
                            .personalEmail(username + "@gmail.com")
                            .build();
                    User savedUser = userRepository.save(newUser);
                    log.info("Created user: {} ({}), role: {}", username, fullName,
                            role.getRoleName());
                    return savedUser;
                });
    }

    private User initLecturer(String username, String email, String password, String fullName, Role role,
                              String lecturerId, String department, String faculty) {
        User user = initUser(username, email, password, fullName, role, department, faculty);
        if (lecturerProfileRepository.findById(user.getUserId()).isEmpty()) {
            LecturerProfile profile = LecturerProfile.builder()
                    .user(user)
                    .lecturerId(lecturerId)
                    .build();
            lecturerProfileRepository.save(profile);
            log.info("Created lecturer profile for: {}", username);
        }
        return user;
    }

    private User initStudent(String username, String email, String password, String fullName, Role role,
                             String studentId, String grade, String department, String faculty) {
        User user = initUser(username, email, password, fullName, role, department, faculty);
        if (studentProfileRepository.findById(user.getUserId()).isEmpty()) {
            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .studentId(studentId)
                    .grade(grade)
                    .frontStudentCardMedia(1L) // Dummy media ID
                    .backStudentCardMedia(2L) // Dummy media ID
                    .build();
            studentProfileRepository.save(profile);
            log.info("Created student profile for: {}", username);
        }
        return user;
    }

    private ResearchGroup initResearchGroup(String name, String desc, String project, GroupType type,
                                            boolean isPrivate,
                                            User creator) {
        return researchGroupRepository.findByGroupName(name)
                .orElseGet(() -> {
                    ResearchGroup group = ResearchGroup.builder()
                            .groupName(name)
                            .description(desc)
                            .projectName(project)
                            .groupType(type)
                            .isPrivate(isPrivate)
                            .creator(creator)
                            .status("ACTIVE")
                            .build();
                    ResearchGroup savedGroup = researchGroupRepository.save(group);
                    log.info("Created research group: {}", name);
                    return savedGroup;
                });
    }

    private void initMembership(ResearchGroup group, User user, MemberRole role) {
        if (!groupMembershipRepository.existsByResearchGroup_ResearchGroupIdAndUser_UserId(
                group.getResearchGroupId(),
                user.getUserId())) {
            GroupMembership membership = GroupMembership.builder()
                    .researchGroup(group)
                    .user(user)
                    .role(role)
                    .build();
            groupMembershipRepository.save(membership);
            log.info("Added user {} to group {} with role {}", user.getUsername(), group.getGroupName(),
                    role);
        }
    }

    private void initLabRoom(String roomName, String building, int capacity, double latitude, double longitude) {
        if (!labRoomRepository.existsByRoomName(roomName)) {
            LabRoom room = LabRoom.builder()
                    .roomName(roomName)
                    .building(building)
                    .capacity(capacity)
                    .latitude(latitude)
                    .longitude(longitude)
                    .build();
            labRoomRepository.save(room);
            log.info("Created lab room: {} with lat: {}, lng: {}", roomName, latitude, longitude);
        }
    }

    private void initSlot(String name, String start, String end, String desc) {
        if (!slotRepository.existsBySlotName(name)) {
            Slot slot = Slot.builder()
                    .slotName(name)
                    .startTime(LocalTime.parse(start))
                    .endTime(LocalTime.parse(end))
                    .description(desc)
                    .build();
            slotRepository.save(slot);
            log.info("Created slot: {}", name);
        }
    }

    private Device initDevice(String name, String type, String icon) {
        return deviceRepository.findByDeviceName(name)
                .orElseGet(() -> {
                    Device device = Device.builder()
                            .deviceName(name)
                            .deviceType(type)
                            .icon(icon)
                            .build();
                    Device saved = deviceRepository.save(device);
                    log.info("Created device: {}", name);
                    return saved;
                });
    }

    private void initLabRoomDevice(LabRoom room, Device device, int quantity) {
        if (!labRoomDeviceRepository.existsByLabRoom_LabRoomIdAndDevice_DeviceId(room.getLabRoomId(),
                device.getDeviceId())) {
            LabRoomDevice roomDevice = LabRoomDevice.builder()
                    .labRoom(room)
                    .device(device)
                    .quantity(quantity)
                    .build();
            labRoomDeviceRepository.save(roomDevice);
            log.info("Added {} units of {} to room {}", quantity, device.getDeviceName(),
                    room.getRoomName());
        }
    }

    private void initializeAttendanceConfig() {
        if (attendanceConfigRepo.count() == 0) {
            AttendanceSystemConfig config = AttendanceSystemConfig.builder()
                    .earlyCheckinMinutes(15)
                    .lateCheckinMinutes(10)
                    .earlyCheckoutMinutes(10)
                    .lateCheckoutMinutes(15)
                    .labRadiusMeters(50.0)
                    .active(true)
                    .build();
            attendanceConfigRepo.save(config);
            log.info("Initialized default attendance configuration: earlyCheckin=15, lateCheckin=10, earlyCheckout=10, lateCheckout=15, radius=50.0");
        } else {
            log.info("Attendance configuration already exists, skipping initialization");
        }
    }

    private void initializeBookingConfig() {
        if (bookingConfigRepo.count() == 0) {
            BookingSystemConfig config = BookingSystemConfig.builder()
                    .studentAdvanceDays(7)
                    .lecturerAdvanceDays(14)
                    .adminAdvanceDays(30)
                    .minMinutesBeforeStartToCancel(120)
                    .minMinutesBeforeStartToApprove(15)
                    .studentMinMinutesToBook(60)
                    .lecturerMinMinutesToBook(-15)
                    .active(true)
                    .build();
            bookingConfigRepo.save(config);
            log.info("Initialized default booking configuration: student=7 days, lecturer=14 days, admin=30 days");
        } else {
            log.info("Booking configuration already exists, skipping initialization");
        }
    }
}
