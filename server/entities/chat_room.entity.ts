import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ChatRoomConnection } from './chat_room_connection.entity';
import { User } from './user.entity';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  radius: number;

  @Column()
  name: string;

  @Column()
  lastModified: Date;

  @ManyToOne(() => User, (user) => user.chatRooms)
  user: User;

  @OneToMany(() => ChatRoomConnection, (chatRoomConnection) => chatRoomConnection.chatRoom)
  chatRoomConnections: ChatRoomConnection[];
}
