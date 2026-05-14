package iuh.labbooking.controller;

import iuh.labbooking.dto.request.password.ChangePasswordRequest;
import iuh.labbooking.dto.request.password.ForgotPasswordRequest;
import iuh.labbooking.dto.request.password.ResetPasswordRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.otp.SendOtpResponse;
import iuh.labbooking.service.password.PasswordService;
import iuh.labbooking.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/password")
@RequiredArgsConstructor
@Tag(name = "Password", description = "APIs for password management")
public class PasswordController {

    private final PasswordService passwordService;
    private final CookieUtil cookieUtil;

    @PostMapping("/forgot")
    @Operation(summary = "Forgot password", description = "Initiate password reset by sending OTP to registered email")
    public ResponseEntity<ApiResponse<SendOtpResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        SendOtpResponse response = passwordService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password", description = "Reset password using the reset token from OTP verification")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful. Please login with your new password.", null));
    }

    @PostMapping("/change")
    @Operation(
            summary = "Change password",
            description = "Change password for currently logged in user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse httpResponse) {
        
        passwordService.changePassword(request);
        
        ResponseCookie cookie = cookieUtil.createExpiredRefreshTokenCookie();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully. Please login again.", null));
    }
}
