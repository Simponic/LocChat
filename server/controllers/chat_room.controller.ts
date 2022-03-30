import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { JwtBody } from 'server/decorators/jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { ChatRoomService } from 'server/providers/services/chat_room.service';
import { UsersService } from 'server/providers/services/users.service';

@Controller()
export class ChatRoomController {
  constructor(private chatRoomService: ChatRoomService, private usersService: UsersService) {}

  @Get('/chat_rooms')
  async get(@Query() query: any) {
    console.log(query);
    return await this.chatRoomService.near(query);
  }

  @Post('/chat_rooms')
  async create(@JwtBody() jwtBody: JwtBodyDto, @Body() chatRoom: any) {
    chatRoom.user = await this.usersService.find(jwtBody.userId);
    console.log(jwtBody);
    return await this.chatRoomService.create(chatRoom);
  }

  private async authorized(jwtBody: JwtBodyDto, chatRoom: any) {
    const user = await this.usersService.find(jwtBody.userId);
    if (user.id !== chatRoom.user.id) {
      return {
        error: 'You are not the owner of this chat room',
      };
    }
    return true;
  }

  @Put('/chat_rooms/:id')
  async update(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number, @Body() chatRoom: any) {
    console.log(id);
    const chat_room = await this.chatRoomService.findById(id, ['user']);
    if (!(await this.authorized(jwtBody, chat_room))) {
      return chat_room;
    }
    chat_room.latitude = chatRoom.latitude;
    chat_room.longitude = chatRoom.longitude;
    chat_room.radius = chatRoom.radius;
    return await this.chatRoomService.save(chat_room);
  }

  @Delete('/chat_rooms/:id')
  async delete(@JwtBody() jwtBody: JwtBodyDto, @Param('id') id: number) {
    const chat_room = await this.chatRoomService.findById(id, ['user']);
    if (!(await this.authorized(jwtBody, chat_room))) {
      return false;
    }
    return await this.chatRoomService.remove(chat_room);
  }
}
