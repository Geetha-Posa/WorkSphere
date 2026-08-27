export type UserRole = 'admin' | 'manager' | 'employee';

export type TaskStatus = 'unassigned' | 'pending review' | 'resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  team: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
  team: string;
}
