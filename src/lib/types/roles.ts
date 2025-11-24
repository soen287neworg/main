// These are roles populated by the seeder and SHOULD be populated on the production db
export enum GenericRoles {
  STUDENT = "Student",
  STAFF = "Staff",
  ADMIN = "Admin",
}

export enum BitfieldSystemDefinitions {
  BOOK_RESOURCES = 0x1,
  MANAGE_RESOURCES = 0x2,
  MANAGE_USERS = 0x4,
  MANAGE_ROLES = 0x5,
  MANAGE_ANALYTICS = 0x6,
  MANAGE_ALERTS = 0x7,
}

export enum BitfieldRoomDefinitions {}
