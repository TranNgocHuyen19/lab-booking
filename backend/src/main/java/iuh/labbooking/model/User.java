package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 50, columnDefinition = "TEXT")
    private String username;

    @Column(name = "full_name", nullable = false, length = 100, columnDefinition = "TEXT")
    private String fullName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "iuh_email", unique = true, length = 100, columnDefinition = "TEXT")
    private String iuhEmail;

    @Column(name = "personal_email", length = 100, columnDefinition = "TEXT")
    private String personalEmail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "faculty", length = 100)
    private String faculty;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudentProfile studentProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private LecturerProfile lecturerProfile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<GroupMembership> groupMemberships;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
