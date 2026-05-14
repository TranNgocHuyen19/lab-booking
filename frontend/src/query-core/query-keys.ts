export const QUERY_KEYS = {
  USER: {
    ROOT: ['user'] as const,
    ME: ['user', 'me'] as const,
    DETAIL: (id: string | number) => ['user', 'detail', id] as const,
    SEARCH: (params: unknown) => ['user', 'search', params] as const
  },

  SLOT: {
    ROOT: ['slot'] as const,
    LIST: (params: unknown) => ['slot', 'list', params] as const
  },

  ADMIN_SLOT: {
    ROOT: ['admin-slot'] as const,
    DETAIL: (id: number) => ['admin-slot', 'detail', id] as const,
    FILTER: (params: unknown) => ['admin-slot', 'filter', params] as const
  },

  LAB_ROOM: {
    ROOT: ['lab-room'] as const,
    LIST: (params: unknown) => ['lab-room', 'list', params] as const,
    SCHEDULE: (params: unknown) => ['lab-room', 'schedule', params] as const
  },

  ADMIN_LAB_ROOM: {
    ROOT: ['admin-lab-room'] as const,
    DETAIL: (id: number) => ['admin-lab-room', 'detail', id] as const,
    FILTER: (params: unknown) => ['admin-lab-room', 'filter', params] as const,
    INFINITE_FILTER: (params: unknown) => ['admin-lab-room', 'infinite-filter', params] as const
  },

  DEVICE: {
    ROOT: ['device'] as const,
    LIST: (params: unknown) => ['device', 'list', params] as const,
    AVAILABILITY: (params: unknown) => ['device', 'availability', params] as const
  },

  ADMIN_DEVICE: {
    ROOT: ['admin-device'] as const,
    DETAIL: (id: number) => ['admin-device', 'detail', id] as const,
    FILTER: (params: unknown) => ['admin-device', 'filter', params] as const,
    INFINITE_FILTER: (params: unknown) => ['admin-device', 'infinite-filter', params] as const
  },

  BOOKING: {
    ROOT: ['booking'] as const,
    MY: ['booking', 'my'] as const,
    MY_GROUPS: ['booking', 'my-groups'] as const,
    DETAIL: (id: number) => ['booking', 'detail', id] as const,
    PARTICIPANTS: (id: number, params: unknown) => ['booking', 'participants', id, params] as const,
    PARTICIPANTS_BASIC: (id: number, params: unknown) => ['booking', 'participants-basic', id, params] as const,
    PARTICIPANT_USERNAMES: (id: number) => ['booking', 'participant-usernames', id] as const,
    STATUS_HISTORY: (id: number) => ['booking', 'status-history', id] as const
  },

  ADMIN_BOOKING: {
    ROOT: ['admin-booking'] as const,
    DETAIL: (id: number) => ['admin-booking', 'detail', id] as const,
    FILTER: (params: unknown) => ['admin-booking', 'filter', params] as const,
    RECENT_PENDING: (limit: number) => ['admin-booking', 'recent-pending', limit] as const,
    SLOT_DETAIL: (params: { labRoomId: number; slotId: number; bookingDate: string }) =>
      ['admin-booking', 'slot-detail', params] as const,
    SLOT_DETAIL_PARTICIPANTS: (bookingId: number) => ['admin-booking', 'slot-detail-participants', bookingId] as const
  },

  ATTENDANCE: {
    ROOT: ['attendance'] as const,
    BY_BOOKING: (bookingId: number) => ['attendance', 'booking', bookingId] as const,
    STATUS: (bookingId: number) => ['attendance', 'status', bookingId] as const
  },

  RESEARCH_GROUP: {
    ROOT: ['research-group'] as const,
    LIST: (params: unknown) => ['research-group', 'list', params] as const,
    INFINITE: (params: unknown) => ['research-group', 'infinite', params] as const,
    OTHER: (params: unknown) => ['research-group', 'other', params] as const,
    MINE: (params: unknown) => ['research-group', 'mine', params] as const,
    DETAIL: (groupId: number) => ['research-group', 'detail', groupId] as const,
    LEADERS: (params: unknown) => ['research-group', 'leaders', params] as const,
    MY_LEADERS: (params: unknown) => ['research-group', 'my-leaders', params] as const,
    OTHER_LEADERS: (params: unknown) => ['research-group', 'other-leaders', params] as const,
    MEMBERS: (groupId: number, params?: unknown) => ['research-group', 'members', groupId, params] as const,
    SEARCH_TO_INVITE: (groupId: number, params: unknown) =>
      ['research-group', 'search-to-invite', groupId, params] as const
  },

  LECTURER_RESEARCH_GROUP: {
    ROOT: ['lecturer-research-group'] as const,
    MANAGED: (params: unknown) => ['lecturer-research-group', 'managed', params] as const,
    INFINITE_MANAGED: (params: unknown) => ['lecturer-research-group', 'infinite-managed', params] as const,
    DETAIL: (groupId: number) => ['lecturer-research-group', 'detail', groupId] as const
  },

  ADMIN_RESEARCH_GROUP: {
    ROOT: ['admin-research-group'] as const,
    LIST: (params: unknown) => ['admin-research-group', 'list', params] as const,
    INFINITE: (params: unknown) => ['admin-research-group', 'infinite', params] as const,
    DETAIL: (groupId: number) => ['admin-research-group', 'detail', groupId] as const
  },

  GROUP_JOIN_REQUEST: {
    ROOT: ['group-join-request'] as const,
    MY_REQUESTS: (params: unknown) => ['group-join-request', 'my-requests', params] as const,
    DETAIL: (requestId: number) => ['group-join-request', 'detail', requestId] as const
  },

  LECTURER_GROUP_JOIN_REQUEST: {
    ROOT: ['lecturer-group-join-request'] as const,
    MY_GROUPS: (params: unknown) => ['lecturer-group-join-request', 'my-groups', params] as const,
    BY_GROUP: (groupId: number, params: unknown) =>
      ['lecturer-group-join-request', 'by-group', groupId, params] as const
  },

  ADMIN_GROUP_JOIN_REQUEST: {
    ROOT: ['admin-group-join-request'] as const,
    ALL_GROUPS: (params: unknown) => ['admin-group-join-request', 'all-groups', params] as const,
    DETAIL: (requestId: number) => ['admin-group-join-request', 'detail', requestId] as const
  },

  DASHBOARD: {
    ROOT: ['dashboard'] as const,
    KPI: (params: unknown) => ['dashboard', 'kpi', params] as const,
    DEVICE_USAGE: (params: unknown) => ['dashboard', 'device-usage', params] as const,
    ROOM_ACTIVITY: (params: unknown) => ['dashboard', 'room-activity', params] as const,
    BOOKING_TYPE: (params: unknown) => ['dashboard', 'booking-type', params] as const,
    BOOKING_TREND: (params: unknown) => ['dashboard', 'booking-trend', params] as const
  },

  ROOM_STATISTICS: {
    ROOT: ['room-statistics'] as const,
    SUMMARY: (params: unknown) => ['room-statistics', 'summary', params] as const,
    HEATMAP: (params: unknown) => ['room-statistics', 'heatmap', params] as const,
    USAGE_DETAILS: (params: unknown) => ['room-statistics', 'usage-details', params] as const
  },

  RESEARCH_GROUP_STATISTICS: {
    ROOT: ['research-group-statistics'] as const,
    SUMMARY: (params: unknown) => ['research-group-statistics', 'summary', params] as const,
    DISTRIBUTION: (params: unknown) => ['research-group-statistics', 'distribution', params] as const,
    USAGE_DETAILS: (params: unknown) => ['research-group-statistics', 'usage-details', params] as const
  },
  LAB_BOOKING_STATISTICS: {
    ROOT: ['lab-booking-statistics'] as const,
    KPI: (params: unknown) => ['lab-booking-statistics', 'kpi', params] as const,
    OUTCOME: (params: unknown) => ['lab-booking-statistics', 'outcome', params] as const,
    TREND: (params: unknown) => ['lab-booking-statistics', 'trend', params] as const,
    AUDIT_LOGS: (params: unknown) => ['lab-booking-statistics', 'audit-logs', params] as const,
    REJECTION_REASONS: (params: unknown) => ['lab-booking-statistics', 'rejection-reasons', params] as const
  },
  LECTURER_DASHBOARD: {
    ROOT: ['lecturer-dashboard'] as const,
    DATA: (params: unknown) => ['lecturer-dashboard', 'data', params] as const
  },

  SYSTEM_CONFIG: {
    ROOT: ['system-config'] as const,
    ATTENDANCE: ['system-config', 'attendance'] as const,
    BOOKING: ['system-config', 'booking'] as const,
    ATTENDANCE_HISTORY: ['system-config', 'attendance-history'] as const,
    BOOKING_HISTORY: ['system-config', 'booking-history'] as const,
    ALL_HISTORY: ['system-config', 'all-history'] as const
  }
} as const
