import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from 'server/entities/chat_room.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
  ) {}

  create(chatRoom: ChatRoom) {
    return this.chatRoomRepository.save(chatRoom);
  }

  all() {
    return this.chatRoomRepository.find();
  }

  findById(id: number) {
    return this.chatRoomRepository.findOne(id);
  }
}
