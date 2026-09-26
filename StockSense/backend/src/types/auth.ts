import { Role } from "@prisma/client";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  assignedWarehouseIds: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    assignedWarehouseIds: string[];
  };
  accessToken: string;
}
