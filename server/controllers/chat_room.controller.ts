import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { JwtBody } from 'server/decorators/jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';
import { ChatRoomService } from 'server/providers/services/chat_room.service';
import { UsersService } from 'server/providers/services/users.service';

const haversine = (p1, p2) => {
  const degreesToRadians = (degrees) => degrees * (Math.PI / 180);
  const delta = { lat: degreesToRadians(p2.lat - p1.lat), lng: degreesToRadians(p2.lng - p1.lng) };
  const a =
    Math.sin(delta.lat / 2) * Math.sin(delta.lat / 2) +
    Math.cos(degreesToRadians(p1.lat)) *
      Math.cos(degreesToRadians(p2.lat)) *
      Math.sin(delta.lng / 2) *
      Math.sin(delta.lng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const r = 6371 * 1000;
  return r * c;
};
@Controller()
export class ChatRoomController {
  constructor(private chatRoomService: ChatRoomService, private usersService: UsersService) {}

  @Get('/chat_rooms')
  async get(@JwtBody() jwtBody: JwtBodyDto, @Query() query: any) {
    return await this.chatRoomService.nearOrUserOwns({ ...query, userId: jwtBody.userId });
  }

  @Get('/chat_rooms/:id')
  async getId(@Param('id') id: number) {
    return await this.chatRoomService.findById(id);
  }

  @Get('/chat_rooms/:id/joinable')
  async joinable(@JwtBody() jwtBody, @Param('id') id: number, @Query() query: any) {
    return !!(await this.chatRoomService.nearOrUserOwns({ ...query, userId: jwtBody.userId })).find(
      (cr) => cr.id == id && haversine({ lat: cr.latitude, lng: cr.longitude }, query) < cr.radius,
    );
  }

  @Post('/chat_rooms')
  async create(@JwtBody() jwtBody: JwtBodyDto, @Body() chatRoom: any) {
    chatRoom.user = await this.usersService.find(jwtBody.userId);
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
