export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: Date;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  project?: Project;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedTo: string | null;
  dueDate: Date;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  project?: Project;
  assignedUser?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  projectId: string | null;
  taskId: string | null;
  user?: User;
  project?: Project;
  task?: Task;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
