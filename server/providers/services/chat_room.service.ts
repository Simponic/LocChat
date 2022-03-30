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

  near({ lat, lng }: { lat: number; lng: number }) {
    return this.chatRoomRepository.query(
      `SELECT * FROM chat_room WHERE calculate_distance(latitude, longitude, ${lat}, ${lng}, 'M') < 5`,
    );
  }

  findById(id: number, relations: string[] = []) {
    return this.chatRoomRepository.findOne(id, { relations });
  }

  save(chatRoom: ChatRoom) {
    return this.chatRoomRepository.save(chatRoom);
  }

  remove(chatRoom: ChatRoom) {
    return this.chatRoomRepository.remove(chatRoom);
  }
}
