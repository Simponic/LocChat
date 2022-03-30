import { Controller, Get } from '@nestjs/common';
import { ChatRoomService } from 'server/providers/services/chat_room.service';

@Controller()
export class ChatRoomController {
  constructor(private chatRoomService: ChatRoomService) {}

  @Get('/chat_rooms')
  async get() {
    return await this.chatRoomService.all();
  }
}
