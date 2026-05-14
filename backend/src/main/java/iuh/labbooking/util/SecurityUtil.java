package iuh.labbooking.util;

import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_SESSION_ID = "sid";

    public Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken();
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED, "Invalid authentication type");
    }

    public String getCurrentUsername() {
        return getCurrentJwt().getSubject();
    }

    public Long getCurrentUserId() {
        Jwt jwt = getCurrentJwt();
        Object userId = jwt.getClaim(CLAIM_USER_ID);

        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Missing userId claim");
        }

        if (userId instanceof Long) {
            return (Long) userId;
        } else if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        } else {
            return Long.parseLong(userId.toString());
        }
    }

    public String getCurrentJwtId() {
        return getCurrentJwt().getId();
    }

    public String getCurrentSessionId() {
        Jwt jwt = getCurrentJwt();
        return jwt.getClaimAsString(CLAIM_SESSION_ID);
    }

    @SuppressWarnings("unchecked")
    public List<String> getCurrentRoles() {
        Jwt jwt = getCurrentJwt();
        Object roles = jwt.getClaim(CLAIM_ROLES);

        if (roles == null) {
            return Collections.emptyList();
        }

        if (roles instanceof List) {
            return (List<String>) roles;
        }

        return Collections.emptyList();
    }

    public String getCurrentRole() {
        List<String> roles = getCurrentRoles();
        if (roles.isEmpty()) {
            return null;
        }
        String role = roles.get(0);
        return role.startsWith("ROLE_") ? role.substring(5) : role;
    }

    public List<String> getCurrentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return Collections.emptyList();
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    public long getRemainingTtlSeconds() {
        Jwt jwt = getCurrentJwt();
        if (jwt.getExpiresAt() == null) {
            return 0;
        }
        long remainingMs = jwt.getExpiresAt().toEpochMilli() - System.currentTimeMillis();
        return Math.max(0, remainingMs / 1000);
    }

    public boolean hasRole(String role) {
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getCurrentAuthorities().contains(roleWithPrefix);
    }

    public boolean hasAnyRole(String... roles) {
        List<String> authorities = getCurrentAuthorities();
        for (String role : roles) {
            String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            if (authorities.contains(roleWithPrefix)) {
                return true;
            }
        }
        return false;
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public boolean isLecturer() {
        return hasRole("LECTURER");
    }

    public boolean isStudent() {
        return hasRole("STUDENT");
    }

    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null 
                && authentication.isAuthenticated()
                && authentication instanceof JwtAuthenticationToken;
    }

    public User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
