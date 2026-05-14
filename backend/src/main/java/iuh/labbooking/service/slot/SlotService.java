package iuh.labbooking.service.slot;

import iuh.labbooking.dto.request.slot.BulkSlotStatusRequest;
import iuh.labbooking.dto.request.slot.SlotRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.slot.SecureSlotResponse;

import java.util.List;

public interface SlotService {
    SecureSlotResponse createSlot(SlotRequest request);

    SecureSlotResponse updateSlot(Long id, SlotRequest request);

    SecureSlotResponse findSlotById(Long id);

    PageResponse<List<SlotResponse>> findSlots(int page, int limit, String keyword);

    PageResponse<List<SecureSlotResponse>> filterSlots(int page, int limit, String keyword, Boolean active);

    void toggleSlotStatus(Long id);
    
    void updateSlotsStatus(BulkSlotStatusRequest request);
}
