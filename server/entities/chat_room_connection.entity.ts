import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { ChatRoom } from './chat_room.entity';

@Entity()
export class ChatRoomConnection {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.chatRooms)
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatRoomConnections)
  chatRoom: ChatRoom;
}
