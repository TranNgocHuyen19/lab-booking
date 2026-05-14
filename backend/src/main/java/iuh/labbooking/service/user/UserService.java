package iuh.labbooking.service.user;

import iuh.labbooking.dto.request.user.ChangePasswordRequest;
import iuh.labbooking.dto.request.user.UpdateUserRequest;
import iuh.labbooking.dto.request.user.CreateUserRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.user.SecureUserResponse;
import iuh.labbooking.dto.response.user.UserResponse;

import iuh.labbooking.model.User;

import java.util.List;

public interface UserService {

    User findEntityByUsername(String username);

    SecureUserResponse createUser(CreateUserRequest request);

    UserResponse findUserByUsername(String username);

    PageResponse<List<SecureUserResponse>> findAllUsersAdmin(int page, int size, String sortBy, String sortDir);

    PageResponse<List<UserResponse>> filterUsers(String keyword, String role, int page, int size);

    PageResponse<List<SecureUserResponse>> filterUsersAdmin(String keyword, String role, Boolean active, int page,
            int size);

    void deleteUser(String username);

    void changePassword(String username, ChangePasswordRequest request);

    void changeMyPassword(ChangePasswordRequest request);

    void updateActive(String username, boolean active);

    UserResponse updateProfile(UpdateUserRequest request);

    SecureUserResponse updateUserAdmin(String username, UpdateUserRequest request);

    UserResponse findMyProfileDetailed();
}
