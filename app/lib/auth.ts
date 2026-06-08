import { cookies } from "next/headers";
import { verifyJWT, type JWTPayload } from "./jwt";
import prisma from "./prisma";

// Get current user from JWT token
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    // In Next.js 15+, cookies() is asynchronous
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return null;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Get current user with full database details
export async function getCurrentUserWithDetails() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error in getCurrentUserWithDetails:", error);
    return null;
  }
}

// Require authentication (throws error if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Require admin role
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

// Require project manager or admin
export async function requireProjectManager() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  if (user.role !== "ADMIN" && user.role !== "PROJECT_MANAGER") {
    throw new Error("Forbidden: Project Manager or Admin access required");
  }
  return user;
}

// Require project manager only (not admin)
export async function requireProjectManagerOnly() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  if (user.role !== "PROJECT_MANAGER") {
    throw new Error("Forbidden: Project Manager access required");
  }
  return user;
}

// Require team member or higher (any authenticated user)
export async function requireTeamMember() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

// Check if user has any of the specified roles
export function hasRole(user: JWTPayload | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Check if user is admin
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === "ADMIN";
}

// Check if user is project manager
export function isProjectManager(user: JWTPayload | null): boolean {
  return user?.role === "PROJECT_MANAGER";
}

// Check if user is team member
export function isTeamMember(user: JWTPayload | null): boolean {
  return user?.role === "TEAM_MEMBER";
}

// Check if user is project manager or admin
export function isProjectManagerOrAdmin(user: JWTPayload | null): boolean {
  return user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
}

// Check if user can manage a specific project
export async function canManageProject(
  user: JWTPayload | null,
  projectId: string,
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "PROJECT_MANAGER") return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  return project?.ownerId === user.userId;
}

// Check if user can manage a specific task
export async function canManageTask(
  user: JWTPayload | null,
  taskId: string,
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "PROJECT_MANAGER") return true;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { ownerId: true },
      },
    },
  });

  if (!task) return false;

  // User is task assignee
  if (task.assignedTo === user.userId) return true;

  // User is project owner
  return task.project.ownerId === user.userId;
}

// Check if user can view a specific project
export async function canViewProject(
  user: JWTPayload | null,
  projectId: string,
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "PROJECT_MANAGER") return true;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.userId },
        { members: { some: { userId: user.userId } } },
      ],
    },
  });

  return !!project;
}

// Get user's role level (higher number = more permissions)
export function getRoleLevel(role: string): number {
  switch (role) {
    case "ADMIN":
      return 3;
    case "PROJECT_MANAGER":
      return 2;
    case "TEAM_MEMBER":
      return 1;
    default:
      return 0;
  }
}

// Check if user has sufficient role level
export function hasMinRoleLevel(
  user: JWTPayload | null,
  minLevel: number,
): boolean {
  if (!user) return false;
  return getRoleLevel(user.role) >= minLevel;
}

// Get formatted role name for display
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "PROJECT_MANAGER":
      return "Project Manager";
    case "TEAM_MEMBER":
      return "Team Member";
    default:
      return "Unknown";
  }
}

// Get role color for badges
export function getRoleColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "PROJECT_MANAGER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "TEAM_MEMBER":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}
