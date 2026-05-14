package iuh.labbooking.service.labroom;

import iuh.labbooking.dto.request.labroom.LabRoomDeviceRequest;
import iuh.labbooking.dto.request.labroom.BulkLabRoomStatusRequest;
import iuh.labbooking.dto.request.labroom.LabRoomRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.labroom.LabRoomResponse;
import iuh.labbooking.dto.response.labroom.SecureLabRoomResponse;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.LabRoomMapper;
import iuh.labbooking.model.Device;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.LabRoomDevice;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabRoomServiceImpl implements LabRoomService {

    private final LabRoomRepository labRoomRepository;
    private final DeviceRepository deviceRepository;
    private final LabRoomMapper labRoomMapper;

    @Override
    @Transactional
    public SecureLabRoomResponse createLabRoom(LabRoomRequest request) {
        if (labRoomRepository.existsByRoomName(request.roomName())) {
            throw new AppException(ErrorCode.ROOM_NAME_ALREADY_EXISTS);
        }

        LabRoom labRoom = labRoomMapper.toEntity(request);
        
        if (request.devices() != null && !request.devices().isEmpty()) {
            List<LabRoomDevice> labRoomDevices = mapDevicesToLabRoom(request.devices(), labRoom);
            labRoom.setLabRoomDevices(labRoomDevices);
        }

        labRoom = labRoomRepository.save(labRoom);
        return labRoomMapper.toResponse(labRoom);
    }

    @Override
    @Transactional
    public SecureLabRoomResponse updateLabRoom(Long id, LabRoomRequest request) {
        LabRoom labRoom = labRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        if (labRoomRepository.existsByRoomNameAndLabRoomIdNot(request.roomName(), id)) {
            throw new AppException(ErrorCode.ROOM_NAME_ALREADY_EXISTS);
        }

        labRoomMapper.updateEntity(request, labRoom);

        if (request.devices() != null) {
            labRoom.getLabRoomDevices().clear();
            if (!request.devices().isEmpty()) {
                List<LabRoomDevice> newDevices = mapDevicesToLabRoom(request.devices(), labRoom);
                labRoom.getLabRoomDevices().addAll(newDevices);
            }
        }

        labRoom = labRoomRepository.save(labRoom);
        return labRoomMapper.toResponse(labRoom);
    }

    private List<LabRoomDevice> mapDevicesToLabRoom(List<LabRoomDeviceRequest> requests, LabRoom labRoom) {
        return requests.stream().map(req -> {
            Device device = deviceRepository.findById(req.deviceId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));
            return LabRoomDevice.builder()
                    .labRoom(labRoom)
                    .device(device)
                    .quantity(req.quantity())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public SecureLabRoomResponse findLabRoomById(Long id) {
        LabRoom labRoom = labRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));
        return labRoomMapper.toResponse(labRoom);
    }

    @Override
    public LabRoomResponse findPublicLabRoomById(Long id) {
        LabRoom labRoom = labRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));
        return labRoomMapper.toPublicResponse(labRoom);
    }

    @Override
    public PageResponse<List<LabRoomResponse>> findLabRooms(int page, int limit, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<LabRoom> labRooms = labRoomRepository.filterLabRooms(pageable, keyword, true);
        return PageResponse.fromPage(labRooms, labRoomMapper::toPublicResponse);
    }

    @Override
    public PageResponse<List<SecureLabRoomResponse>> filterLabRoomsAdmin(int page, int limit, String keyword, Boolean active) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<LabRoom> labRooms = labRoomRepository.filterLabRooms(pageable, keyword, active);
        return PageResponse.fromPage(labRooms, labRoomMapper::toResponse);
    }

    @Override
    @Transactional
    public void toggleLabRoomStatus(Long id) {
        LabRoom labRoom = labRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));
        labRoom.setActive(!labRoom.isActive());
        labRoomRepository.save(labRoom);
    }

    @Override
    @Transactional
    public void updateLabRoomsStatus(BulkLabRoomStatusRequest request) {
        if (request.ids() == null || request.ids().isEmpty()) {
            return;
        }
        labRoomRepository.updateActiveStatus(request.ids(), request.active());
    }
}
