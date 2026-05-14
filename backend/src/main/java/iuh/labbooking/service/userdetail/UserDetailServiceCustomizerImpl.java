package iuh.labbooking.service.userdetail;

/*
 * @description: UserDetailServiceCustomizer
 * @author: Trần Ngọc Huyền
 * @date: 12/19/2025
 * @version: 1.0
 */

import iuh.labbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailServiceCustomizerImpl implements UserDetailServiceCustomizer {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

    }
}
