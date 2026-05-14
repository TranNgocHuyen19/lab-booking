package iuh.labbooking.util.redis;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public final class OtpHashUtil {

    private OtpHashUtil() {}

    private static final String HASH_ALGORITHM = "SHA-256";

    public static String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = random.nextInt(999999);
        return String.format("%06d", otp);
    }

    public static String hash(String otp) {
        if (otp == null || otp.isEmpty()) {
            throw new IllegalArgumentException("OTP cannot be null or empty");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashBytes = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public static boolean verify(String plainOtp, String storedHash) {
        if (plainOtp == null || storedHash == null) {
            return false;
        }
        String inputHash = hash(plainOtp);
        return constantTimeEquals(inputHash, storedHash);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < aBytes.length; i++) {
            result |= aBytes[i] ^ bBytes[i];
        }
        return result == 0;
    }

    public static String generateResetToken() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
