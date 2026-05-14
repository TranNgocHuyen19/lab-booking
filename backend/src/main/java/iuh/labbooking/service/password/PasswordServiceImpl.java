package iuh.labbooking.service.password;

import iuh.labbooking.dto.request.password.ChangePasswordRequest;
import iuh.labbooking.dto.request.password.ForgotPasswordRequest;
import iuh.labbooking.dto.request.password.ResetPasswordRequest;
import iuh.labbooking.dto.response.otp.SendOtpResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.token.TokenStoreService;
import iuh.labbooking.dto.request.otp.SendOtpRequest;
import iuh.labbooking.service.otp.OtpService;
import iuh.labbooking.util.RoleUtil;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {

    private static final String SCOPE_PASSWORD_RESET = "password_reset";

    private final TokenStoreService tokenStoreService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;
    private final OtpService otpService;

    @Override
    public SendOtpResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String role = request.role();

        User user = findUserByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (role != null) {
            boolean isStudent = RoleUtil.isStudent(user);
            boolean requestFromStudentPortal = RoleUtil.isStudent(role);
            if (requestFromStudentPortal != isStudent) {
                log.warn("Role mismatch for password reset: {} (Request: {}, Actual isStudent: {})", 
                        maskEmail(normalizedEmail), role, isStudent);
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }
        }

        return otpService.sendOtp(new SendOtpRequest(normalizedEmail, SCOPE_PASSWORD_RESET, null));
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        if (!otpService.verifyResetToken(normalizedEmail, request.resetToken())) {
            throw new AppException(ErrorCode.RESET_TOKEN_INVALID);
        }

        User user = findUserByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        tokenStoreService.revokeAllUserTokens(null, user.getUsername(), user.getUserId(), 0);

        otpService.clearAllData(normalizedEmail);

        log.info("Password reset successful for user: {}", user.getUsername());
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = securityUtil.getCurrentUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            log.warn("Change password failed: incorrect current password for user {}", username);
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user {}", username);
    }

    private Optional<User> findUserByEmail(String email) {
        return userRepository.findByIuhEmail(email)
                .or(() -> userRepository.findByPersonalEmail(email));
    }

    private String normalizeEmail(String email) {
        return email != null ? email.toLowerCase().trim() : "";
    }

    private String maskEmail(String email) {
        if (email == null || email.length() < 4) return "***";
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return email.charAt(0) + "***" + email.substring(atIndex);
        return email.substring(0, 2) + "***" + email.substring(atIndex);
    }
}
