export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  action?: AIAction;
  createdAt?: Date;
}

export interface AIAction {
  type: 'create_leave_request' | 'create_ot_request' | 'view_payslip' |
        'view_attendance' | 'generate_report' | 'navigate';
  data: Record<string, unknown>;
  label?: string;
}

export interface AIConversation {
  id: string;
  title?: string;
  messages: AIMessage[];
  createdAt: Date;
}

export interface UserContext {
  user: {
    id: string;
    name: string;
    role: string;
  };
  employee?: {
    id: string;
    code: string;
    department: string;
    position: string;
  };
  leaveBalances?: Array<{
    type: string;
    typeName: string;
    available: number;
    used: number;
    entitlement: number;
  }>;
  currentMonth?: {
    workDays: number;
    actualDays: number;
    otHours: number;
    lateDays: number;
  };
  pendingRequests?: number;
  isManager?: boolean;
  teamSize?: number;
}
