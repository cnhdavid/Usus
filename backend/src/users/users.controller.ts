import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import type { Request } from 'express';

@Controller('api/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  async me(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.toResponse(user);
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toResponse(await this.usersService.findById(id));
  }

  @Post()
  async signup(@Body() dto: CreateUserDto, @Req() req: Request) {
    const user = await this.usersService.create(dto);
    await new Promise<void>((resolve, reject) =>
      req.login(user, (err) => (err ? reject(err) : resolve())),
    );
    return this.usersService.toResponse(user);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request) {
    return this.usersService.toResponse(req.user as any);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    return new Promise<{ message: string }>((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err);
        req.session.destroy(() => resolve({ message: 'Logged out' }));
      });
    });
  }

  @Put(':id')
  @UseGuards(AuthenticatedGuard)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.toResponse(await this.usersService.update(id, dto));
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);
  }
}
