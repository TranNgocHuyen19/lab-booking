package iuh.labbooking.service.otp;

import iuh.labbooking.dto.request.otp.SendOtpRequest;
import iuh.labbooking.dto.request.otp.VerifyOtpRequest;
import iuh.labbooking.dto.response.otp.SendOtpResponse;
import iuh.labbooking.dto.response.otp.VerifyOtpResponse;

public interface OtpService {

    SendOtpResponse sendOtp(SendOtpRequest request);

    VerifyOtpResponse verifyOtp(VerifyOtpRequest request);

    long getRemainingCooldown(String email, String scope);

    int getRemainingAttempts(SendOtpRequest request);

    void clearOtpData(SendOtpRequest request);

    boolean verifyResetToken(String email, String token);

    void clearAllData(String email);
}
