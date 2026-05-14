package iuh.labbooking.configuration.security.jwt;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String ROLES_CLAIM = "roles";
    private static final String ROLE_PREFIX = "ROLE_";

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Object rolesObj = jwt.getClaim(ROLES_CLAIM);

        if (rolesObj == null) {
            return Collections.emptyList();
        }

        List<String> roles;
        if (rolesObj instanceof List) {
            roles = (List<String>) rolesObj;
        } else if (rolesObj instanceof String) {
            roles = List.of((String) rolesObj);
        } else {
            return Collections.emptyList();
        }

        return roles.stream()
                .map(role -> {
                    String normalizedRole = role.startsWith(ROLE_PREFIX) ? role : ROLE_PREFIX + role;
                    return new SimpleGrantedAuthority(normalizedRole);
                })
                .collect(Collectors.toList());
    }
}
