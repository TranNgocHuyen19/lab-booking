package iuh.labbooking.service.slot;

import iuh.labbooking.dto.request.slot.BulkSlotStatusRequest;
import iuh.labbooking.dto.request.slot.SlotRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.slot.SecureSlotResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.SlotMapper;
import iuh.labbooking.model.Slot;
import iuh.labbooking.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final SlotMapper slotMapper;

    @Override
    @Transactional
    public SecureSlotResponse createSlot(SlotRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }
        Slot slot = slotMapper.toEntity(request);
        slot = slotRepository.save(slot);
        return slotMapper.toResponse(slot);
    }

    @Override
    @Transactional
    public SecureSlotResponse updateSlot(Long id, SlotRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        slotMapper.updateEntity(request, slot);
        slot = slotRepository.save(slot);
        return slotMapper.toResponse(slot);
    }

    @Override
    public SecureSlotResponse findSlotById(Long id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));
        return slotMapper.toResponse(slot);
    }

    @Override
    public PageResponse<List<SlotResponse>> findSlots(int page, int limit, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Slot> slots = slotRepository.findSlotsByKeywordAndActiveTrue(keyword, pageable);
        return PageResponse.fromPage(slots, slotMapper::toPublicResponse);
    }

    @Override
    public PageResponse<List<SecureSlotResponse>> filterSlots(int page, int limit, String keyword, Boolean active) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Slot> slots = slotRepository.filterSlots(pageable, keyword, active);
        return PageResponse.fromPage(slots, slotMapper::toResponse);
    }

    @Override
    @Transactional
    public void toggleSlotStatus(Long id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));
        slot.setActive(!slot.isActive());
        slotRepository.save(slot);
    }

    @Override
    @Transactional
    public void updateSlotsStatus(BulkSlotStatusRequest request) {
        if (request.ids() == null || request.ids().isEmpty()) {
            return;
        }
        slotRepository.updateActiveStatus(request.ids(), request.active());
    }
}
