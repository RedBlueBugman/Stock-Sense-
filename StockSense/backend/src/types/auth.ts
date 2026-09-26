import { Role } from "./enums";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role | string;
  assignedWarehouseIds: string[];
}