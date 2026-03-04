import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import type { Request } from 'express';

@Controller('api/habits')
@UseGuards(AuthenticatedGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  private getUserId(req: Request): number {
    return (req.user as any).id;
  }

  @Get()
  getHabits(@Req() req: Request) {
    return this.habitsService.findAllByUser(this.getUserId(req));
  }

  @Get(':id')
  getHabit(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.habitsService.findById(id, this.getUserId(req));
  }

  @Post()
  createHabit(@Body() dto: CreateHabitDto, @Req() req: Request) {
    return this.habitsService.create({ ...dto, userId: this.getUserId(req) });
  }

  @Put(':id')
  updateHabit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHabitDto,
    @Req() req: Request,
  ) {
    return this.habitsService.update(id, this.getUserId(req), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteHabit(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.habitsService.delete(id, this.getUserId(req));
  }
}
