import { Injectable } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";
import { User } from "../common/types";
import { RequestUser } from "../auth/request-user.interface";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
  private readonly file = "users.json";

  constructor(private readonly storage: JsonStorageService) {}

  async findAll(): Promise<User[]> {
    return this.storage.read<User[]>(this.file, []);
  }

  async findById(id: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find((user) => user.id === id);
  }

  async findOrCreateFromAuth(authUser: RequestUser): Promise<User> {
    const users = await this.findAll();
    const existing = users.find(
      (user) =>
        user.id === authUser.id ||
        (authUser.clerkUserId && user.clerkUserId === authUser.clerkUserId),
    );

    if (existing) {
      return existing;
    }

    const created: User = {
      id: authUser.id || uuid(),
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
      createdAt: new Date().toISOString(),
      clerkUserId: authUser.clerkUserId,
    };

    await this.storage.write(this.file, [...users, created]);
    return created;
  }
}
