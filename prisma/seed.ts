import { hashPassword } from "@/app/lib/bcrypt";
import prisma from "@/app/lib/prisma";
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";

async function main() {
  console.log("Seeding database...");

  // Hash passwords
  const adminPassword = await hashPassword("123456");
  const managerPassword = await hashPassword("123456");
  const memberPassword = await hashPassword("123456");

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      email: "manager@demo.com",
      password: managerPassword,
      name: "Project Manager",
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: {
      email: "member@demo.com",
      password: memberPassword,
      name: "Team Member",
      role: UserRole.TEAM_MEMBER,
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "E-commerce Platform",
      description: "Build a modern e-commerce platform with React and Node.js",
      deadline: new Date("2025-06-30"),
      status: ProjectStatus.ACTIVE,
      ownerId: manager.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Create a cross-platform mobile app using React Native",
      deadline: new Date("2025-08-15"),
      status: ProjectStatus.ACTIVE,
      ownerId: manager.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "AI Integration Project",
      description: "Integrate AI features into existing products",
      deadline: new Date("2025-05-20"),
      status: ProjectStatus.ON_HOLD,
      ownerId: admin.id,
    },
  });

  // Add project members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: member.id },
      { projectId: project2.id, userId: member.id },
      { projectId: project1.id, userId: admin.id },
    ],
  });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Design Database Schema",
      description: "Create PostgreSQL schema for the e-commerce platform",
      projectId: project1.id,
      assignedTo: member.id,
      dueDate: new Date("2025-04-15"),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Implement Authentication",
      description: "Set up JWT authentication with HTTP-only cookies",
      projectId: project1.id,
      assignedTo: member.id,
      dueDate: new Date("2025-04-20"),
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Create UI Components",
      description: "Build reusable React components with Tailwind CSS",
      projectId: project2.id,
      assignedTo: member.id,
      dueDate: new Date("2025-04-18"),
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
    },
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: member.id,
        title: "New Task Assigned",
        message: 'You have been assigned to "Design Database Schema"',
        type: "TASK_ASSIGNED",
        read: false,
      },
      {
        userId: member.id,
        title: "Project Update",
        message: "E-commerce Platform project deadline is approaching",
        type: "PROJECT_UPDATE",
        read: false,
      },
      {
        userId: admin.id,
        title: "New Project Created",
        message: "Manager created a new project: Mobile App Development",
        type: "PROJECT_CREATED",
        read: true,
      },
    ],
  });

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: manager.id,
        action: "PROJECT_CREATED",
        details: 'Created project "E-commerce Platform"',
        projectId: project1.id,
      },
      {
        userId: manager.id,
        action: "TASK_ASSIGNED",
        details: `Assigned task "${task1.title}" to ${member.name}`,
        projectId: project1.id,
        taskId: task1.id,
      },
      {
        userId: member.id,
        action: "TASK_UPDATED",
        details: `Updated task "${task1.title}" status to IN_PROGRESS`,
        projectId: project1.id,
        taskId: task1.id,
      },
      {
        userId: admin.id,
        action: "MEMBER_ADDED",
        details: `Added ${member.name} to project "${project1.name}"`,
        projectId: project1.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("Demo users created:");
  console.log("Admin: admin@demo.com / 123456");
  console.log("Manager: manager@demo.com / 123456");
  console.log("Member: member@demo.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
