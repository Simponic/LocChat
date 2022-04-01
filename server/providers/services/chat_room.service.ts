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

  nearOrUserOwns({ lat, lng, userId }: { lat: number; lng: number; userId: number }) {
    // SQL injection maybe?
    return this.chatRoomRepository.query(
      `SELECT * FROM chat_room WHERE calculate_distance(latitude, longitude, ${lat}, ${lng}, 'M') < 5 OR "userId" = ${userId}`,
    );
  }

  findById(id: string, relations: string[] = []) {
    return this.chatRoomRepository.findOne(id, { relations });
  }

  save(chatRoom: ChatRoom) {
    return this.chatRoomRepository.save(chatRoom);
  }

  remove(chatRoom: ChatRoom) {
    return this.chatRoomRepository.remove(chatRoom);
  }
}
