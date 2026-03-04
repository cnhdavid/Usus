import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import type { Request } from 'express';
export declare class HabitsController {
    private readonly habitsService;
    constructor(habitsService: HabitsService);
    private getUserId;
    getHabits(req: Request): any;
    getHabit(id: number, req: Request): Promise<any>;
    createHabit(dto: CreateHabitDto, req: Request): any;
    updateHabit(id: number, dto: UpdateHabitDto, req: Request): Promise<any>;
    deleteHabit(id: number, req: Request): Promise<void>;
}
