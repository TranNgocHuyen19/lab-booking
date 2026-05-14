package iuh.labbooking.controller;

import iuh.labbooking.dto.request.otp.SendOtpRequest;
import iuh.labbooking.dto.request.otp.VerifyOtpRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.otp.SendOtpResponse;
import iuh.labbooking.dto.response.otp.VerifyOtpResponse;
import iuh.labbooking.service.otp.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
@Tag(name = "OTP", description = "APIs for OTP generation and verification")
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    @Operation(summary = "Send OTP", description = "Generate and send OTP to the specified email address")
    public ResponseEntity<ApiResponse<SendOtpResponse>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        SendOtpResponse response = otpService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP", description = "Verify the OTP code and get reset token")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = otpService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @GetMapping("/cooldown")
    @Operation(summary = "Get OTP cooldown", description = "Check remaining cooldown time")
    public ResponseEntity<ApiResponse<Long>> getCooldown(
            @RequestParam String email, 
            @RequestParam String scope) {
        long remaining = otpService.getRemainingCooldown(email, scope);
        return ResponseEntity.ok(ApiResponse.success(remaining));
    }
}
