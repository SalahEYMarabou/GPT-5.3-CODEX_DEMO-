import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JsonStorageService } from "../common/json-storage.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JsonStorageService],
  exports: [AuthService],
})
export class AuthModule {}
