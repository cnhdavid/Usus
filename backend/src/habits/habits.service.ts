import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: number) {
    return this.prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: number, userId: number) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== userId) throw new NotFoundException(`Habit with ID ${id} not found`);
    return habit;
  }

  create(dto: CreateHabitDto & { userId: number }) {
    return this.prisma.habit.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        frequency: dto.frequency ?? 'Daily',
        targetCount: dto.targetCount ?? 1,
        targetValue: dto.targetValue ?? null,
        unit: dto.unit ?? null,
        category: dto.category ?? null,
        userId: dto.userId,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateHabitDto) {
    await this.findById(id, userId);
    return this.prisma.habit.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.targetCount !== undefined && { targetCount: dto.targetCount }),
        ...(dto.targetValue !== undefined && { targetValue: dto.targetValue }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
    });
  }

  async delete(id: number, userId: number) {
    await this.findById(id, userId);
    await this.prisma.habit.delete({ where: { id } });
  }
}
