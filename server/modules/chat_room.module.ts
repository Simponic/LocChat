import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomController } from 'server/controllers/chat_room.controller';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { ChatRoomService } from 'server/providers/services/chat_room.service';
import { UsersService } from 'server/providers/services/users.service';
import { UsersModule } from './users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom]), UsersModule],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, UsersService],
  exports: [TypeOrmModule],
})
export class ChatRoomModule {}
