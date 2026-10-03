export interface SupportTicketReply {
  id: string;
  sender_name: string;
  created_by_type: 'patient' | 'agent';
  created_at: string;
  message: string;
}

export interface SupportTicketAttachment {
  id: string;
  name: string;
  size: string;
  uri: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  category: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: string;
  userEmail: string;
  message: string;
  attachments?: SupportTicketAttachment[];
  replies?: SupportTicketReply[];
}

export interface SupportCategory {
  id: string;
  name: string;
}

export const MOCK_SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'cat-1', name: 'Appointments & Booking' },
  { id: 'cat-2', name: 'Billing & Invoices' },
  { id: 'cat-3', name: 'Prescriptions & EMR' },
  { id: 'cat-4', name: 'Technical Support' },
  { id: 'cat-5', name: 'General Inquiry' },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tk-1',
    ticketNo: '#TK-10928',
    category: 'Appointments & Booking',
    subject: 'Appointment Rescheduling Request',
    status: 'open',
    createdAt: '2026-08-14T10:30:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'I need to reschedule my consultation with Dr. Sarah Jenkins to next week due to an unavoidable personal schedule conflict.',
    attachments: [
      {
        id: 'att-1',
        name: 'Schedule_Conflict_Note.jpg',
        size: '1.2 MB',
        uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
      },
    ],
    replies: [
      {
        id: 'rep-1',
        sender_name: 'Support Agent (Rohan)',
        created_by_type: 'agent',
        created_at: '2026-08-14T11:00:00.000Z',
        message:
          'Hello John! We received your request. We are coordinating with the doctor clinic staff to check available slots for next week.',
      },
    ],
  },
  {
    id: 'tk-2',
    ticketNo: '#TK-10892',
    category: 'Billing & Invoices',
    subject: 'Duplicate Charge Inquiry',
    status: 'open',
    createdAt: '2026-08-12T14:15:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'I noticed a duplicate transaction on my credit card for invoice #INV-2041. Kindly verify and initiate a refund for the extra charge.',
    replies: [],
  },
  {
    id: 'tk-3',
    ticketNo: '#TK-10741',
    category: 'Technical Support',
    subject: 'Video Call Connection Issues',
    status: 'closed',
    createdAt: '2026-08-05T09:00:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'The video consultation screen was freezing frequently on Android during my appointment session.',
    replies: [
      {
        id: 'rep-2',
        sender_name: 'Support Agent (Priya)',
        created_by_type: 'agent',
        created_at: '2026-08-05T10:30:00.000Z',
        message:
          'Thank you for reporting this. We released app update v1.0.1 which optimizes WebRTC connections. Please update your app.',
      },
    ],
  },
  {
    id: 'tk-4',
    ticketNo: '#TK-10892',
    category: 'Billing & Invoices',
    subject: 'Duplicate Charge Inquiry',
    status: 'open',
    createdAt: '2026-08-12T14:15:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'I noticed a duplicate transaction on my credit card for invoice #INV-2041. Kindly verify and initiate a refund for the extra charge.',
    replies: [],
  },
  {
    id: 'tk-5',
    ticketNo: '#TK-10741',
    category: 'Technical Support',
    subject: 'Video Call Connection Issues',
    status: 'open',
    createdAt: '2026-08-05T09:00:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'The video consultation screen was freezing frequently on Android during my appointment session.',
    replies: [
      {
        id: 'rep-2',
        sender_name: 'Support Agent (Priya)',
        created_by_type: 'agent',
        created_at: '2026-08-05T10:30:00.000Z',
        message:
          'Thank you for reporting this. We released app update v1.0.1 which optimizes WebRTC connections. Please update your app.',
      },
    ],
  },
  {
    id: 'tk-6',
    ticketNo: '#TK-10892',
    category: 'Billing & Invoices',
    subject: 'Duplicate Charge Inquiry',
    status: 'open',
    createdAt: '2026-08-12T14:15:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'I noticed a duplicate transaction on my credit card for invoice #INV-2041. Kindly verify and initiate a refund for the extra charge.',
    replies: [],
  },
  {
    id: 'tk-7',
    ticketNo: '#TK-10741',
    category: 'Technical Support',
    subject: 'Video Call Connection Issues',
    status: 'closed',
    createdAt: '2026-08-05T09:00:00.000Z',
    userEmail: 'john.doe@example.com',
    message:
      'The video consultation screen was freezing frequently on Android during my appointment session.',
    replies: [
      {
        id: 'rep-2',
        sender_name: 'Support Agent (Priya)',
        created_by_type: 'agent',
        created_at: '2026-08-05T10:30:00.000Z',
        message:
          'Thank you for reporting this. We released app update v1.0.1 which optimizes WebRTC connections. Please update your app.',
      },
    ],
  },
];
