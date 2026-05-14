package iuh.labbooking.service.labroom;

import iuh.labbooking.dto.request.labroom.LabRoomRequest;
import iuh.labbooking.dto.request.labroom.BulkLabRoomStatusRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.labroom.LabRoomResponse;
import iuh.labbooking.dto.response.labroom.SecureLabRoomResponse;

import java.util.List;

public interface LabRoomService {
    SecureLabRoomResponse createLabRoom(LabRoomRequest request);
    SecureLabRoomResponse updateLabRoom(Long id, LabRoomRequest request);
    SecureLabRoomResponse findLabRoomById(Long id);
    LabRoomResponse findPublicLabRoomById(Long id);
    PageResponse<List<LabRoomResponse>> findLabRooms(int page, int limit, String keyword);
    
    PageResponse<List<SecureLabRoomResponse>> filterLabRoomsAdmin(int page, int limit, String keyword, Boolean active);

    void toggleLabRoomStatus(Long id);

    void updateLabRoomsStatus(BulkLabRoomStatusRequest request);
}
