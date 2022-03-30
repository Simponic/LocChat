import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomController } from 'server/controllers/chat_room.controller';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { ChatRoomService } from 'server/providers/services/chat_room.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom])],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
