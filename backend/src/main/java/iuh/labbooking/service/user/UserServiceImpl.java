package iuh.labbooking.service.user;

import iuh.labbooking.dto.request.user.ChangePasswordRequest;
import iuh.labbooking.dto.request.user.CreateUserRequest;
import iuh.labbooking.dto.request.user.UpdateUserRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.user.SecureUserResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.UserMapper;
import iuh.labbooking.model.LecturerProfile;
import iuh.labbooking.model.StudentProfile;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.LecturerProfileRepository;
import iuh.labbooking.repository.StudentProfileRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.token.TokenStoreService;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenStoreService tokenStoreService;
    private final SecurityUtil securityUtil;
    private final StudentProfileRepository studentProfileRepository;
    private final LecturerProfileRepository lecturerProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public User findEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public SecureUserResponse createUser(CreateUserRequest request) {
        if ("STUDENT".equals(request.role())) {
            throw new AppException(ErrorCode.CANNOT_CREATE_STUDENT_ACCOUNT);
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (request.iuhEmail() != null && userRepository.existsByIuhEmail(request.iuhEmail())) {
            throw new AppException(ErrorCode.IUH_EMAIL_ALREADY_EXISTS);
        }

        if (request.personalEmail() != null && userRepository.existsByPersonalEmail(request.personalEmail())) {
            throw new AppException(ErrorCode.PERSONAL_EMAIL_ALREADY_EXISTS);
        }

        User user = userMapper.toUser(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        userRepository.save(user);

        if ("LECTURER".equals(request.role())) {
            LecturerProfile lecturerProfile = LecturerProfile.builder()
                    .user(user)
                    .lecturerId(request.lecturerId())
                    .build();
            lecturerProfileRepository.save(lecturerProfile);
            user.setLecturerProfile(lecturerProfile);
        }

        return userMapper.toSecureResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<SecureUserResponse>> findAllUsersAdmin(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findAll(pageable);

        return PageResponse.fromPage(userPage, userMapper::toSecureResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<UserResponse>> filterUsers(String keyword, String role, int page, int size) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.filterUsers(keyword, role, pageable);

        return PageResponse.fromPage(userPage, userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<SecureUserResponse>> filterUsersAdmin(String keyword, String role, Boolean active,
            int page,
            int size) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.filterUsersAdmin(keyword, role, active, pageable);

        return PageResponse.fromPage(userPage, userMapper::toSecureResponse);
    }

    @Override
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Override
    public void changeMyPassword(ChangePasswordRequest request) {
        User user = securityUtil.getCurrentUser();
        String username = user.getUsername();
        Long userId = user.getUserId();
        String jwtId = securityUtil.getCurrentJwtId();
        long remainingTtlSeconds = securityUtil.getRemainingTtlSeconds();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        tokenStoreService.revokeAllUserTokens(
                jwtId,
                username,
                userId,
                remainingTtlSeconds);

        log.info("Password changed and all tokens revoked for user {}", username);
    }

    @Override
    public void updateActive(String username, boolean active) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setActive(active);
        userRepository.save(user);
    }

    @Override
    public UserResponse updateProfile(UpdateUserRequest request) {
        User user = securityUtil.getCurrentUser();

        if (request.dob() != null)
            user.setDob(request.dob());
        if (request.phone() != null)
            user.setPhone(request.phone());
        if (request.personalEmail() != null)
            user.setPersonalEmail(request.personalEmail());
        if (request.department() != null)
            user.setDepartment(request.department());
        if (request.faculty() != null)
            user.setFaculty(request.faculty());

        String role = user.getRole().getRoleName();

        if ("STUDENT".equals(role)) {
            StudentProfile studentProfile = studentProfileRepository.findByUser(user)
                    .orElseGet(() -> studentProfileRepository.save(
                            StudentProfile.builder().user(user).build()));

            if (request.grade() != null) {
                studentProfile.setGrade(request.grade());
            }

            user.setStudentProfile(studentProfile);
        }

        if ("LECTURER".equals(role)) {
            LecturerProfile lecturerProfile = lecturerProfileRepository.findByUser(user)
                    .orElseGet(() -> lecturerProfileRepository.save(
                            LecturerProfile.builder().user(user).build()));

            user.setLecturerProfile(lecturerProfile);
        }

        userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Override
    public SecureUserResponse updateUserAdmin(String username, UpdateUserRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.dob() != null)
            user.setDob(request.dob());
        if (request.phone() != null)
            user.setPhone(request.phone());
        if (request.personalEmail() != null)
            user.setPersonalEmail(request.personalEmail());
        if (request.department() != null)
            user.setDepartment(request.department());
        if (request.faculty() != null)
            user.setFaculty(request.faculty());

        String role = user.getRole().getRoleName();

        if ("STUDENT".equals(role)) {
            StudentProfile studentProfile = studentProfileRepository.findByUser(user)
                    .orElseGet(() -> studentProfileRepository.save(
                            StudentProfile.builder().user(user).build()));

            if (request.grade() != null) {
                studentProfile.setGrade(request.grade());
            }

            user.setStudentProfile(studentProfile);
        }

        userRepository.save(user);

        return userMapper.toSecureResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findMyProfileDetailed() {
        User user = securityUtil.getCurrentUser();
        return userMapper.toResponse(user);
    }
}
