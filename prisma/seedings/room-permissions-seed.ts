import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  name: "room-permissions",
  seed: async (prisma: PrismaClient) => {
    const rooms = await prisma.room.findMany();
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();

    if (rooms.length === 0 || roles.length === 0 || users.length === 0) {
      console.log("Please seed rooms, roles, and users first.");
      return;
    }

    const adminRole = roles.find((role) => role.name === "Admin");
    const userRole = roles.find((role) => role.name === "Student");

    if (!adminRole || !userRole) {
      console.log("Admin or Student role not found.");
      return;
    }

    const data: Prisma.RoomPermissionCreateInput[] = [
      // Admin role has all permissions on the first room
      {
        room: { connect: { id: rooms[0].id } },
        role: { connect: { id: adminRole.id } },
        permissions: 3, // CAN_BOOK_WITHOUT_APPROVAL | CAN_BOOK_WITHOUT_ALLOWANCE
      },
      // User role has basic permissions on the first room
      {
        room: { connect: { id: rooms[0].id } },
        role: { connect: { id: userRole.id } },
        permissions: 0,
      },
      // A specific user has special permissions on the first room
      {
        room: { connect: { id: rooms[0].id } },
        user: { connect: { id: users[0].id } },
        permissions: 1, // CAN_BOOK_WITHOUT_APPROVAL
      },
    ];

    for (const permission of data) {
      await prisma.roomPermission.create({ data: permission });
    }
  },
  dependsOn: ["rooms", "roles", "users"],
};
