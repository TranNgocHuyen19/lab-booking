package iuh.labbooking.service.authentication;

import com.nimbusds.jose.JOSEException;
import iuh.labbooking.dto.jwt.JwtInformation;
import iuh.labbooking.dto.jwt.TokenPayload;
import iuh.labbooking.dto.request.auth.*;
import iuh.labbooking.dto.response.auth.LoginResponse;
import iuh.labbooking.dto.response.auth.TokenResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.*;
import iuh.labbooking.service.file.FileService;
import iuh.labbooking.service.groupjoinrequest.GroupJoinRequestService;
import iuh.labbooking.service.jwt.JwtService;
import iuh.labbooking.service.token.TokenStoreService;
import iuh.labbooking.util.SecurityUtil;
import iuh.labbooking.util.RoleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;
    private final JwtService jwtService;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final GroupJoinRequestService groupJoinRequestService;
    private final FileService fileService;
    private final TokenStoreService tokenStoreService;

    @Override
    public LoginResponse studentLogin(LoginRequest request, String userAgent, String ipAddress) {
        User user = authenticateUser(request);
        
        if (!RoleUtil.isStudent(user)) {
            log.warn("Non-student user {} attempted to login via student portal", user.getUsername());
            throw new AppException(ErrorCode.LOGIN_ROLE_NOT_ALLOWED);
        }
        
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        return completeLogin(user, roleName, userAgent, ipAddress);
    }

    @Override
    public LoginResponse lecturerLogin(LoginRequest request, String userAgent, String ipAddress) {
        User user = authenticateUser(request);
        
        if (RoleUtil.isStudent(user)) {
            log.warn("Student user {} attempted to login via lecturer portal", user.getUsername());
            throw new AppException(ErrorCode.LOGIN_ROLE_NOT_ALLOWED);
        }
        
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        return completeLogin(user, roleName, userAgent, ipAddress);
    }

    private User authenticateUser(LoginRequest request) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.username(), request.password());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        User user = (User) authentication.getPrincipal();

        if (!user.isActive()) {
            log.warn("Login attempt for disabled account: {}", user.getUsername());
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }
        
        return user;
    }

    @Override
    @Transactional
    public LoginResponse register(
            RegisterRequest request, String userAgent, String ipAddress) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        if (userRepository.existsByIuhEmail(request.iuhEmail())) {
            throw new AppException(ErrorCode.IUH_EMAIL_ALREADY_EXISTS);
        }

        if (request.personalEmail() != null && userRepository.existsByPersonalEmail(request.personalEmail())) {
            throw new AppException(ErrorCode.PERSONAL_EMAIL_ALREADY_EXISTS);
        }

        if (fileService.findById(request.frontStudentCard()).id() != request.frontStudentCard()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND, "Front student card file not found");
        }
        if (fileService.findById(request.backStudentCard()).id() != request.backStudentCard()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND, "Back student card file not found");
        }

        User user = User.builder()
                .username(request.username())
                .fullName(request.fullName())
                .passwordHash(passwordEncoder.encode(request.password()))
                .dob(request.dob())
                .phone(request.phone())
                .iuhEmail(request.iuhEmail())
                .department(request.department())
                .faculty(request.faculty())
                .build();

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(studentRole);
        userRepository.save(user);

        StudentProfile studentProfile = StudentProfile.builder()
                .user(user)
                .studentId(request.username())
                .grade(request.grade())
                .frontStudentCardMedia(request.frontStudentCard())
                .backStudentCardMedia(request.backStudentCard())
                .build();

        user.setStudentProfile(studentProfile);

        log.info("Auto-login user {} after registration", user.getUsername());

        groupJoinRequestService.createJoinRequests(user, request.researchGroupIds(), request.joinMessage());

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        return completeLogin(user, roleName, userAgent, ipAddress);
    }

    private LoginResponse completeLogin(User user, String roleName, String userAgent, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();

        TokenPayload accessPayload = jwtService.generateAccessToken(user);
        TokenPayload refreshPayload = jwtService.generateRefreshToken(user, sessionId);

        long refreshTtlSeconds = jwtService.getRefreshTokenExpirationSeconds();

        tokenStoreService.createRefreshSession(
                sessionId,
                user.getUserId(),
                user.getUsername(),
                roleName,
                refreshPayload.token(),
                userAgent,
                ipAddress,
                refreshTtlSeconds
        );

        log.info("User {} logged in successfully, sessionId={}", user.getUsername(), sessionId);

        return LoginResponse.builder()
                .accessToken(accessPayload.token())
                .refreshToken(refreshPayload.token())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(roleName)
                .build();
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request, String userAgent, String ipAddress) {
        String refreshToken = request.refreshToken();

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID, "Refresh token is required");
        }

        try {
            jwtService.verifyRefreshToken(refreshToken);
            JwtInformation jwtInfo = jwtService.parseRefreshToken(refreshToken);
            String sessionId = jwtInfo.sessionId();
            String username = jwtInfo.username();

            if (sessionId == null) {
                throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
            }

            boolean isValid = tokenStoreService.validateRefreshSessionWithBinding(sessionId, refreshToken, userAgent, ipAddress);

            if (!isValid) {
                throw new AppException(ErrorCode.REFRESH_TOKEN_REVOKED);
            }

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            if (!user.isActive()) {
                log.warn("Refresh attempt for disabled account: {}", username);
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }

            tokenStoreService.revokeRefreshSession(sessionId);

            String newSessionId = UUID.randomUUID().toString();
            TokenPayload newAccessToken = jwtService.generateAccessToken(user);
            TokenPayload newRefreshToken = jwtService.generateRefreshToken(user, newSessionId);

            String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
            long refreshTtlSeconds = jwtService.getRefreshTokenExpirationSeconds();

            tokenStoreService.createRefreshSession(
                    newSessionId,
                    user.getUserId(),
                    user.getUsername(),
                    roleName,
                    newRefreshToken.token(),
                    userAgent,
                    ipAddress,
                    refreshTtlSeconds
            );

            log.info("Tokens refreshed for user {}, oldSession={}, newSession={}",
                    username, sessionId, newSessionId);

            return TokenResponse.builder()
                    .accessToken(newAccessToken.token())
                    .refreshToken(newRefreshToken.token())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .role(roleName)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        } catch (Exception e) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }
    }

    @Override
    public void logout(String refreshToken) {
        String username = securityUtil.getCurrentUsername();
        Long userId = securityUtil.getCurrentUserId();
        String jwtId = securityUtil.getCurrentJwtId();
        long remainingTtlSeconds = securityUtil.getRemainingTtlSeconds();

        if (remainingTtlSeconds > 0) {
            tokenStoreService.blacklistAccessToken(
                    jwtId,
                    username,
                    userId,
                    remainingTtlSeconds,
                    "LOGOUT"
            );
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                JwtInformation refreshInfo = jwtService.parseRefreshToken(refreshToken);
                String sessionId = refreshInfo.sessionId();
                if (sessionId != null) {
                    tokenStoreService.revokeRefreshSession(sessionId);
                    log.info("Refresh session revoked during logout: sessionId={}", sessionId);
                }
            } catch (Exception e) {
                log.warn("Failed to revoke refresh session during logout: {}", e.getMessage());
            }
        }

        log.info("User {} logged out successfully", username);
    }


    @Override
    public void logoutAll() {
        String username = securityUtil.getCurrentUsername();
        Long userId = securityUtil.getCurrentUserId();
        String jwtId = securityUtil.getCurrentJwtId();
        long remainingTtlSeconds = securityUtil.getRemainingTtlSeconds();

        tokenStoreService.revokeAllUserTokens(
                jwtId,
                username,
                userId,
                remainingTtlSeconds
        );

        log.info("User {} logged out from all devices", username);
    }
}