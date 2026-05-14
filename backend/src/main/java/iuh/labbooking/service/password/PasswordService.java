package iuh.labbooking.service.password;

import iuh.labbooking.dto.request.password.ChangePasswordRequest;
import iuh.labbooking.dto.request.password.ForgotPasswordRequest;
import iuh.labbooking.dto.request.password.ResetPasswordRequest;
import iuh.labbooking.dto.response.otp.SendOtpResponse;

public interface PasswordService {

    SendOtpResponse forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(ChangePasswordRequest request);
}
