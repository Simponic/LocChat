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
import { JwtService } from '../services/jwt.service';
import { UsersService } from '../services/users.service';

@WebSocketGateway()
@UseGuards(GatewayAuthGuard)
export class ChatRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService, private userService: UsersService) {}

  afterInit(server: Server) {
    console.log('Sockets initialized');
  }

  handleConnection(client: Socket) {
    // you can do things like add users to rooms
    // or emit events here.
    // IMPORTANT! The GatewayAuthGuard doesn't trigger on these handlers
    // if you need to do anything in this method you need to authenticate the JWT
    // manually.
    try {
      const jwt = client.handshake.auth.token;
      const jwtBody = this.jwtService.parseToken(jwt);
      const chatRoomId = client.handshake.query.chatRoomId;
      console.log('Client Connected: ', jwtBody.userId);
      client.join(chatRoomId);
    } catch (e) {
      throw new WsException('Invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client Disconnected');
  }

  @SubscribeMessage('message')
  public async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
    @GatewayJwtBody() jwtBody: JwtBodyDto,
  ) {
    const user = await this.userService.find(jwtBody.userId);
    this.server.to(client.handshake.query.chatRoomId).emit('new-message', {
      id: user.id * Math.random() * 2048 * Date.now(),
      content: data,
      userName: `${user.firstName} ${user.lastName}`,
      userId: user.id,
    });
  }
}
