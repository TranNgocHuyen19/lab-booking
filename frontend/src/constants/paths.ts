export const PATHS = {
  HOME: '/',
  FORGOT_PASSWORD: '/forgot-password',
  STUDENT: {
    LOGIN: '/login',
    REGISTER: '/register',
    SCHEDULE: '/student/schedule',
    CONTACT: '/contact',
    SEARCH: '/search',
    GROUPS: '/research-groups',
    GROUP_DETAIL: '/research-groups/:id'
  },
  LECTURER: {
    LOGIN: '/lecturer/login',
    DASHBOARD: '/lecturer',
    RESEARCH_GROUPS: '/lecturer/research-groups',
    ADD_RESEARCH_GROUP: '/lecturer/research-groups/add',
    EDIT_RESEARCH_GROUP: '/lecturer/research-groups/edit/:id',
    RESEARCH_GROUP_DETAIL: '/lecturer/research-groups/:id',
    BOOKINGS: '/lecturer/bookings',
    BOOKING_DETAIL: '/lecturer/bookings/:id',
    JOIN_REQUESTS: '/lecturer/join-requests',
    JOIN_REQUEST_DETAIL: '/lecturer/join-requests/:id',
    BOOKING_HISTORY: '/lecturer/booking-history',
    PROFILE: '/lecturer/profile',
    CHANGE_PASSWORD: '/lecturer/change-password'
  },
  ADMIN: {
    DASHBOARD: '/admin',
    REGISTRATION_SCHEDULE: '/admin/registration-schedule',
    SLOT_BOOKING_DETAIL: '/admin/registration-schedule/:roomId/:slotId/:date',
    LAB_SLOTS: '/admin/slots',
    LAB_ROOMS: '/admin/lab-rooms',
    ADD_LAB_ROOM: '/admin/lab-rooms/add',
    EDIT_LAB_ROOM: '/admin/lab-rooms/edit/:id',
    DEVICES: '/admin/devices',
    RESEARCH_GROUPS: '/admin/research-groups',
    ADD_RESEARCH_GROUP: '/admin/research-groups/add',
    EDIT_RESEARCH_GROUP: '/admin/research-groups/edit/:id',
    RESEARCH_GROUP_DETAIL: '/admin/research-groups/:id',
    ACCOUNTS: '/admin/accounts',
    APPROVALS: {
      RESEARCH_GROUPS: '/admin/approvals/research-groups',
      JOIN_REQUEST_DETAIL: '/admin/approvals/research-groups/:id',
      LAB_BOOKINGS: '/admin/approvals/lab-bookings',
      BOOKING_DETAIL: '/admin/approvals/lab-bookings/:id'
    },
    STATISTICS: {
      RESEARCH_GROUPS: '/admin/statistics/research-groups',
      LAB_BOOKINGS: '/admin/statistics/lab-bookings',
      ROOM_SLOT: '/admin/statistics/room-slot'
    },
    SYSTEM_CONFIG: '/admin/settings/system-config'
  },
  LAB_MANAGER: {
    DASHBOARD: '/lab-manager'
  },
  PROFILE: '/profile'
} as const
