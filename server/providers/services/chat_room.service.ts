import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { User } from 'server/entities/user.entity';
import { ChatRoomConnection } from 'server/entities/chat_room_connection.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomConnection)
    private connectedUsersRepository: Repository<ChatRoomConnection>,
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

  async connectedUsers(chatRoom: ChatRoom) {
    return this.connectedUsersRepository
      .find({
        where: { chatRoom },
        relations: ['user'],
      })
      .then((x) =>
        x.map((x) => {
          return {
            id: x.user.id,
            userName: `${x.user.firstName} ${x.user.lastName}`,
          };
        }),
      );
  }

  connectUser = async function (chatRoom: ChatRoom, user: User) {
    const connectedUser = await this.connectedUsersRepository.findOne({
      where: { chatRoom, user },
    });
    if (connectedUser) {
      return connectedUser;
    }
    const chatRoomConnection = new ChatRoomConnection();
    chatRoomConnection.chatRoom = chatRoom;
    chatRoomConnection.user = user;
    await this.connectedUsersRepository.save(chatRoomConnection);
    return this.connectedUsers(chatRoom);
  };

  disconnectUser = async function (chatRoom: ChatRoom, user: User) {
    const connectedUser = await this.connectedUsersRepository.findOne({
      where: { chatRoom, user },
    });
    if (connectedUser) {
      return this.connectedUsersRepository.remove(connectedUser);
    }
    return false;
  };

  save(chatRoom: ChatRoom) {
    return this.chatRoomRepository.save(chatRoom);
  }

  remove(chatRoom: ChatRoom) {
    return this.chatRoomRepository.remove(chatRoom);
  }
}
