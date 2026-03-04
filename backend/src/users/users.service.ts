import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { username: dto.username, email: dto.email, passwordHash },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }

  toResponse(user: { id: number; username: string; email: string; createdAt: string }) {
    return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
  }
}
