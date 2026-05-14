package iuh.labbooking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMembershipId implements Serializable {
    private Long researchGroup;
    private Long user;
}
