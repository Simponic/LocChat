import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { GatewayJwtBody } from 'server/decorators/gateway_jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { Server, Socket } from 'socket.io';
import { GatewayAuthGuard } from '../guards/gatewayauth.guard';
import { ChatRoomService } from '../services/chat_room.service';
import { JwtService } from '../services/jwt.service';
import { UsersService } from '../services/users.service';

@WebSocketGateway()
@UseGuards(GatewayAuthGuard)
export class ChatRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private chatRoomService: ChatRoomService,
  ) {}

  afterInit(server: Server) {
    console.log('Sockets initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const jwtBody = this.jwtService.parseToken(client.handshake.auth.token);
      const user = await this.userService.find(jwtBody.userId);
      const chatRoom = await this.chatRoomService.findById(client.handshake.query.chatRoomId as unknown as string);
      await this.chatRoomService.connectUser(chatRoom, user);
      client.join(chatRoom.id);
      this.server.to(chatRoom.id).emit('userlist', {
        users: await this.chatRoomService.connectedUsers(chatRoom),
      });
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log('Client Disconnected');
    const jwtBody = this.jwtService.parseToken(client.handshake.auth.token);
    const user = await this.userService.find(jwtBody.userId);
    const chatRoom = await this.chatRoomService.findById(client.handshake.query.chatRoomId as unknown as string);
    await this.chatRoomService.disconnectUser(chatRoom, user);
    this.server.to(chatRoom.id).emit('userlist', {
      users: await this.chatRoomService.connectedUsers(chatRoom),
    });
  }

  @SubscribeMessage('message')
  public async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
    @GatewayJwtBody() jwtBody: JwtBodyDto,
  ) {
    const user = await this.userService.find(jwtBody.userId);
    this.server.to(client.handshake.query.chatRoomId).emit('new-message', {
      id: user.id * Math.random() * Math.pow(2, 16) * Date.now(),
      content: data,
      userName: `${user.firstName} ${user.lastName}`,
      userId: user.id,
    });
  }
}
