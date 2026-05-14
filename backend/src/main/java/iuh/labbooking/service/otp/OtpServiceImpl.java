package iuh.labbooking.service.otp;

import iuh.labbooking.dto.request.otp.SendOtpRequest;
import iuh.labbooking.dto.request.otp.VerifyOtpRequest;
import iuh.labbooking.dto.response.otp.SendOtpResponse;
import iuh.labbooking.dto.response.otp.VerifyOtpResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.mail.MailService;
import iuh.labbooking.util.redis.OtpHashUtil;
import iuh.labbooking.util.redis.RedisKey;
import iuh.labbooking.util.redis.RedisTTL;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final StringRedisTemplate redisTemplate;
    private final MailService mailService;
    private final UserRepository userRepository;

    @Override
    public SendOtpResponse sendOtp(SendOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String scope = request.scope();

        Optional<User> userOptional = findUserByEmail(normalizedEmail);
        
        if ("REGISTER".equalsIgnoreCase(scope)) {
            if (userOptional.isPresent()) {
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
            }
        } else {
            if (userOptional.isEmpty()) {
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }
        }

        checkCooldown(normalizedEmail, scope);

        String plainOtp = OtpHashUtil.generateOtp();
        String hashedOtp = OtpHashUtil.hash(plainOtp);

        String otpKey = RedisKey.otp(scope, normalizedEmail);
        redisTemplate.opsForValue().set(otpKey, hashedOtp, RedisTTL.OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);

        String cooldownKey = RedisKey.otpCooldown(scope, normalizedEmail);
        redisTemplate.opsForValue().set(cooldownKey, "1", RedisTTL.OTP_COOLDOWN_SECONDS, TimeUnit.SECONDS);

        String attemptsKey = RedisKey.otpAttempts(scope, normalizedEmail);
        redisTemplate.delete(attemptsKey);

        try {
            String fullName = userOptional.map(User::getFullName)
                    .orElse(request.name() != null && !request.name().isBlank() ? request.name() : "Người dùng");
                    
            mailService.sendOtp(normalizedEmail, fullName, plainOtp, scope);
            log.info("OTP sent to {} with scope {}", maskEmail(normalizedEmail), scope);
        } catch (Exception e) {
            log.error("Failed to send OTP to {}: {}", maskEmail(normalizedEmail), e.getMessage());
            throw new AppException(ErrorCode.OTP_SEND_FAILED);
        }

        return SendOtpResponse.success(RedisTTL.OTP_COOLDOWN_SECONDS, RedisTTL.OTP_EXPIRY_MINUTES);
    }

    @Override
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String scope = request.scope();
        String otp = request.otp();

        checkAttemptLimit(normalizedEmail, scope);

        String otpKey = RedisKey.otp(scope, normalizedEmail);
        String storedHash = redisTemplate.opsForValue().get(otpKey);

        if (storedHash == null) {
            incrementAttempts(normalizedEmail, scope);
            int remaining = getRemainingAttemptsInternal(normalizedEmail, scope);
            throw new AppException(ErrorCode.OTP_INVALID, "Invalid OTP. " + remaining + " attempts remaining");
        }

        boolean isValid = OtpHashUtil.verify(otp, storedHash);

        if (!isValid) {
            incrementAttempts(normalizedEmail, scope);
            int remaining = getRemainingAttemptsInternal(normalizedEmail, scope);
            throw new AppException(ErrorCode.OTP_INVALID, "Invalid OTP. " + remaining + " attempts remaining");
        }

        redisTemplate.delete(otpKey);
        String attemptsKey = RedisKey.otpAttempts(scope, normalizedEmail);
        redisTemplate.delete(attemptsKey);

        String resetToken = generateResetToken(normalizedEmail);

        log.info("OTP verified for {}", maskEmail(normalizedEmail));
        return VerifyOtpResponse.of(resetToken, RedisTTL.RESET_TOKEN_EXPIRY_MINUTES);
    }

    public String generateResetToken(String email) {
        String normalizedEmail = normalizeEmail(email);
        String token = OtpHashUtil.generateResetToken();
        String hashedToken = OtpHashUtil.hash(token);

        String tokenKey = RedisKey.resetToken(normalizedEmail);
        redisTemplate.opsForValue().set(tokenKey, hashedToken, RedisTTL.RESET_TOKEN_EXPIRY_MINUTES, TimeUnit.MINUTES);

        return token;
    }

    @Override
    public boolean verifyResetToken(String email, String token) {
        String normalizedEmail = normalizeEmail(email);
        String tokenKey = RedisKey.resetToken(normalizedEmail);
        String storedHash = redisTemplate.opsForValue().get(tokenKey);

        if (storedHash == null) {
            return false;
        }

        boolean isValid = OtpHashUtil.verify(token, storedHash);

        if (isValid) {
            redisTemplate.delete(tokenKey);
        }

        return isValid;
    }

    @Override
    public long getRemainingCooldown(String email, String scope) {
        String cooldownKey = RedisKey.otpCooldown(scope, normalizeEmail(email));
        Long ttl = redisTemplate.getExpire(cooldownKey, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    @Override
    public int getRemainingAttempts(SendOtpRequest request) {
        return getRemainingAttemptsInternal(normalizeEmail(request.email()), request.scope());
    }

    @Override
    public void clearOtpData(SendOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String scope = request.scope();
        redisTemplate.delete(RedisKey.otp(scope, normalizedEmail));
        redisTemplate.delete(RedisKey.otpCooldown(scope, normalizedEmail));
        redisTemplate.delete(RedisKey.otpAttempts(scope, normalizedEmail));
        redisTemplate.delete(RedisKey.resetToken(normalizedEmail));
    }

    @Override
    public void clearAllData(String email) {
        String normalizedEmail = normalizeEmail(email);
        String[] scopes = {"REGISTER", "password_reset"};
        for (String scope : scopes) {
            redisTemplate.delete(RedisKey.otp(scope, normalizedEmail));
            redisTemplate.delete(RedisKey.otpCooldown(scope, normalizedEmail));
            redisTemplate.delete(RedisKey.otpAttempts(scope, normalizedEmail));
        }
        redisTemplate.delete(RedisKey.resetToken(normalizedEmail));
    }

    private int getRemainingAttemptsInternal(String email, String scope) {
        String attemptsKey = RedisKey.otpAttempts(scope, email);
        String attemptsStr = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;
        return Math.max(0, RedisTTL.MAX_OTP_ATTEMPTS - attempts);
    }

    private void checkCooldown(String email, String scope) {
        String cooldownKey = RedisKey.otpCooldown(scope, email);
        Long ttl = redisTemplate.getExpire(cooldownKey, TimeUnit.SECONDS);
        if (ttl != null && ttl > 0) {
            throw new AppException(ErrorCode.OTP_COOLDOWN_ACTIVE,
                    "Please wait " + ttl + " seconds before requesting a new OTP");
        }
    }

    private void checkAttemptLimit(String email, String scope) {
        int remaining = getRemainingAttemptsInternal(email, scope);
        if (remaining <= 0) {
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED,
                    "Too many failed attempts. Please wait " + RedisTTL.OTP_LOCKOUT_MINUTES + " minutes");
        }
    }

    private void incrementAttempts(String email, String scope) {
        String attemptsKey = RedisKey.otpAttempts(scope, email);
        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(attemptsKey, RedisTTL.OTP_LOCKOUT_MINUTES, TimeUnit.MINUTES);
        }
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
