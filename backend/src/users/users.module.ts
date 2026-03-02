import { Module } from "@nestjs/common";
import { JsonStorageService } from "../common/json-storage.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, JsonStorageService],
  exports: [UsersService],
})
export class UsersModule {}
