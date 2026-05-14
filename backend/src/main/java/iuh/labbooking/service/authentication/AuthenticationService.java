package iuh.labbooking.service.authentication;

import iuh.labbooking.dto.request.auth.LoginRequest;
import iuh.labbooking.dto.request.auth.RefreshTokenRequest;
import iuh.labbooking.dto.request.auth.RegisterRequest;
import iuh.labbooking.dto.response.auth.LoginResponse;
import iuh.labbooking.dto.response.auth.TokenResponse;

public interface AuthenticationService {

    LoginResponse studentLogin(LoginRequest request, String userAgent, String ipAddress);

    LoginResponse lecturerLogin(LoginRequest request, String userAgent, String ipAddress);

    LoginResponse register(RegisterRequest request, String userAgent, String ipAddress);

    TokenResponse refreshToken(RefreshTokenRequest request, String userAgent, String ipAddress);

    void logout(String refreshToken);

    void logoutAll();
}