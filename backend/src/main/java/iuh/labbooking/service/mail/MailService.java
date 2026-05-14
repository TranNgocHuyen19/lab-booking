package iuh.labbooking.service.mail;

public interface MailService {
    void sendEmail(String to, String subject, String body, boolean isHtml);
    void sendOtp(String to, String name, String otp, String scope);
}
