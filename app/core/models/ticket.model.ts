export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN' | 'TEAM_LEADER';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketFilter {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  searchQuery?: string;
}

export interface TicketCustomer {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface TicketAssignee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  user: string;
  author: string;
  role: UserRole;
  authorRole: UserRole;
  body: string;
  createdAt: string;
}

export interface InternalNote {
  id: string;
  ticketId: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface TicketHistoryLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  role: UserRole;
}

export interface AuditLogEntry {
  id: string;
  ticketId?: string;
  timestamp: string;
  action: string;
  actionType: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  customer: TicketCustomer;
  assignee?: TicketAssignee;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  solutionSummary?: string;
  comments: TicketComment[];
  internalNotes?: InternalNote[];
  auditLog: AuditLogEntry[];
  history: TicketHistoryLog[];
}