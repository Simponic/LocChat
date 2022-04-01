import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { User } from 'server/entities/user.entity';
import { ChatRoomConnection } from 'server/entities/chat_room_connection.entity';
import { UsersService } from './users.service';
import { RoleKey } from 'server/entities/role.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomConnection)
    private connectedUsersRepository: Repository<ChatRoomConnection>,
    private usersService: UsersService,
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

  async inactiveRooms() {
    const inactiveRooms = await this.chatRoomRepository.find({
      relations: ['user'],
      where: {
        lastModified: LessThan(new Date(Date.now() - 1000 * 60 * 60 * 2)),
      },
    });
    const isInactivePromises = inactiveRooms.map(async (room) => {
      const isAdmin = await this.usersService.hasRootRole(room.user.id, RoleKey.ADMIN);
      const hasMoreThanOneConnections = (await this.connectedUsers(room)).length > 1;
      return !isAdmin && !hasMoreThanOneConnections;
    });
    const results = await Promise.all(isInactivePromises);

    return inactiveRooms.filter((_, index) => results[index]);
  }

  save(chatRoom: ChatRoom) {
    return this.chatRoomRepository.save(chatRoom);
  }

  remove(chatRoom: ChatRoom) {
    return this.chatRoomRepository.remove(chatRoom);
  }
}
