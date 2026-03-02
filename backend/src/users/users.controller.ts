import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { RequestUser } from "../auth/request-user.interface";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listUsers() {
    return this.usersService.findAll();
  }

  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    return this.usersService.findOrCreateFromAuth(user);
  }
}
