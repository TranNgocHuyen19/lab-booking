package iuh.labbooking.service.groupjoinrequest;

import iuh.labbooking.dto.request.groupjoinrequest.UpdateJoinRequestStatusRequest;
import iuh.labbooking.dto.request.groupjoinrequest.BulkJoinRequestUpdate;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestDetailResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestResponse;
import iuh.labbooking.dto.response.groupjoinrequest.SecureGroupJoinRequestResponse;
import iuh.labbooking.model.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface GroupJoinRequestService {

        void createJoinRequests(User user, Set<Long> researchGroupIds, String joinMessage);

        void createJoinRequest(User user, Long researchGroupId, String joinMessage);

        GroupJoinRequestDetailResponse findRequestById(Long requestId);

        PageResponse<List<GroupJoinRequestResponse>> findMyJoinRequests(int page, int size, String status);

        PageResponse<List<SecureGroupJoinRequestResponse>> filterJoinRequestsForMyGroups(
                        int page, int size, String status, String keyword,
                        Long researchGroupId,
                        LocalDate fromDate,
                        LocalDate toDate);

        PageResponse<List<SecureGroupJoinRequestResponse>> filterJoinRequestsByAdmin(
                        int page, int size, String status, String keyword,
                        Long researchGroupId,
                        LocalDate fromDate,
                        LocalDate toDate);

        PageResponse<List<SecureGroupJoinRequestResponse>> findJoinRequestsForGroup(Long groupId, int page, int size,
                        String status, String keyword);

        SecureGroupJoinRequestResponse approveJoinRequest(Long requestId, UpdateJoinRequestStatusRequest request);

        SecureGroupJoinRequestResponse rejectJoinRequest(Long requestId, UpdateJoinRequestStatusRequest request);

        GroupJoinRequestResponse cancelJoinRequest(Long requestId);

        void bulkApproveJoinRequests(BulkJoinRequestUpdate request);

        void bulkRejectJoinRequests(BulkJoinRequestUpdate request);
}
