package iuh.labbooking.util;

import iuh.labbooking.model.User;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public final class RoleUtil {

    private static final String ROLE_STUDENT = "STUDENT";

    public static boolean isStudent(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        return ROLE_STUDENT.equals(user.getRole().getRoleName());
    }

    public static boolean isStudent(String roleName) {
        return ROLE_STUDENT.equalsIgnoreCase(roleName);
    }
}