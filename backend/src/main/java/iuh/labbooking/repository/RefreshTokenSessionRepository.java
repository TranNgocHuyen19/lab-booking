package iuh.labbooking.repository;

import iuh.labbooking.model.RefreshTokenSession;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefreshTokenSessionRepository extends CrudRepository<RefreshTokenSession, String> {
    
    List<RefreshTokenSession> findByUserId(Long userId);
    
    List<RefreshTokenSession> findByUsername(String username);
    
    void deleteByUserId(Long userId);
}
