import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { config } from './database/config';
import { ChatRoomModule } from './modules/chat_room.module';
import { UsersModule } from './modules/users.module';
import { PingGateway } from './providers/gateways/ping.gateway';
import { AuthGuard } from './providers/guards/auth.guard';
import { RolesGuard } from './providers/guards/roles.guard';
import { ChatRoomService } from './providers/services/chat_room.service';
import { JwtService } from './providers/services/jwt.service';
import { RolesService } from './providers/services/roles.service';
import { UsersService } from './providers/services/users.service';
import { GuardUtil } from './providers/util/guard.util';

@Module({
  imports: [TypeOrmModule.forRoot(config), UsersModule, ChatRoomModule],
  controllers: [AppController],
  providers: [
    PingGateway,
    UsersService,
    RolesService,
    JwtService,
    GuardUtil,
    ChatRoomService,
    { provide: APP_GUARD, useClass: AuthGuard }, // auth guard should come before roles guard
    { provide: APP_GUARD, useClass: RolesGuard }, // otherwise users won't be authenticated before roles check
  ],
})
export class AppModule {}
