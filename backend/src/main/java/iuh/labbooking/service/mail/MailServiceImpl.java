package iuh.labbooking.service.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.*;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {

    private final TemplateEngine templateEngine;

    @Value("${brevo.api-key}")
    private String brevoApiKey;

    @Value("${brevo.sender-email}")
    private String fromEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    @Async
    @Override
    public void sendEmail(String to, String subject, String body, boolean isHtml) {
        try {
            log.info("Sending email via Brevo API to: {}", to);

            ApiClient defaultClient = Configuration.getDefaultApiClient();
            ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
            apiKey.setApiKey(brevoApiKey);

            TransactionalEmailsApi apiInstance = new TransactionalEmailsApi();

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setName(senderName);
            sender.setEmail(fromEmail);

            SendSmtpEmailTo recipient = new SendSmtpEmailTo();
            recipient.setEmail(to);

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.setSender(sender);
            sendSmtpEmail.setTo(List.of(recipient));
            sendSmtpEmail.setSubject(subject);
            
            if (isHtml) {
                sendSmtpEmail.setHtmlContent(body);
            } else {
                sendSmtpEmail.setTextContent(body);
            }

            CreateSmtpEmail result = apiInstance.sendTransacEmail(sendSmtpEmail);
            log.info("Email sent successfully via Brevo. Message ID: {}", result.getMessageId());

        } catch (ApiException e) {
            log.error("Brevo API error while sending email to: {}", to);
            log.error("Status code: {}, Reason: {}", e.getCode(), e.getResponseBody());
            throw new RuntimeException("Failed to send email via Brevo: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending email to: {}", to);
            log.error("Error: {}", e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    @Override
    public void sendOtp(String to, String name, String otp, String scope) {
        log.info("Preparing OTP email for: {} with scope: {}", to, scope);
        
        Context context = new Context();
        context.setVariable("otpCode", otp);
        context.setVariable("name", name);
        
        String templateName;
        String subject;
        
        if ("REGISTER".equalsIgnoreCase(scope)) {
            templateName = "mail/register-otp-template";
            subject = "Xác thực đăng ký tài khoản - Lab Room Booking";
        } else {
            templateName = "mail/forgot-password-otp-template";
            subject = "Mã xác thực (OTP) đặt lại mật khẩu - Lab Room Booking";
        }
        
        String htmlContent = templateEngine.process(templateName, context);
        
        sendEmail(to, subject, htmlContent, true);
    }
}
