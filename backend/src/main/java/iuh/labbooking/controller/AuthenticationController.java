package iuh.labbooking.controller;

import iuh.labbooking.dto.request.auth.*;
import iuh.labbooking.dto.response.auth.LoginResponse;
import iuh.labbooking.dto.response.auth.TokenResponse;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.service.authentication.AuthenticationService;
import iuh.labbooking.util.CookieUtil;
import iuh.labbooking.util.HttpRequestUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthenticationController {

    private final AuthenticationService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/student/login")
    @Operation(summary = "Student login", description = "Authenticate student and return JWT tokens")
    public ResponseEntity<ApiResponse<LoginResponse>> studentLogin(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String userAgent = HttpRequestUtil.getUserAgent(httpRequest);
        String ipAddress = HttpRequestUtil.getClientIpAddress(httpRequest);

        LoginResponse response = authService.studentLogin(request, userAgent, ipAddress);

        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(response.refreshToken());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Student login success", response));
    }

    @PostMapping("/lecturer/login")
    @Operation(summary = "Lecturer login", description = "Authenticate lecturer and return JWT tokens")
    public ResponseEntity<ApiResponse<LoginResponse>> lecturerLogin(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String userAgent = HttpRequestUtil.getUserAgent(httpRequest);
        String ipAddress = HttpRequestUtil.getClientIpAddress(httpRequest);

        LoginResponse response = authService.lecturerLogin(request, userAgent, ipAddress);

        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(response.refreshToken());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Lecturer login success", response));
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account and auto-login")
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String userAgent = HttpRequestUtil.getUserAgent(httpRequest);
        String ipAddress = HttpRequestUtil.getClientIpAddress(httpRequest);

        LoginResponse response = authService.register(request, userAgent, ipAddress);
        return new ResponseEntity<>(ApiResponse.created("Registration successful. You are now logged in.", response),
                HttpStatus.CREATED);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh token", description = "Get new access and refresh tokens using current refresh token (rotate)")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = CookieUtil.REFRESH_TOKEN_COOKIE, required = false) String cookieRefreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String refreshToken = cookieRefreshToken;
        if (refreshToken == null && request != null) {
            refreshToken = request.refreshToken();
        }

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);

        String userAgent = HttpRequestUtil.getUserAgent(httpRequest);
        String ipAddress = HttpRequestUtil.getClientIpAddress(httpRequest);

        TokenResponse response = authService.refreshToken(refreshRequest, userAgent, ipAddress);

        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(response.refreshToken());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidate current access token and optionally revoke refresh token", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) LogoutRequest request,
            @CookieValue(name = CookieUtil.REFRESH_TOKEN_COOKIE, required = false) String cookieRefreshToken,
            HttpServletResponse httpResponse) {

        String refreshToken = cookieRefreshToken;
        if (refreshToken == null && request != null) {
            refreshToken = request.refreshToken();
        }

        authService.logout(refreshToken);

        ResponseCookie cookie = cookieUtil.createExpiredRefreshTokenCookie();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout from all devices", description = "Revoke all refresh sessions and blacklist current access token", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logoutAll(HttpServletResponse httpResponse) {
        authService.logoutAll();

        ResponseCookie cookie = cookieUtil.createExpiredRefreshTokenCookie();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Logged out from all devices", null));
    }
}