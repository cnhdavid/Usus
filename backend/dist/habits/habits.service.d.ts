import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
export declare class HabitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: number): any;
    findById(id: number, userId: number): Promise<any>;
    create(dto: CreateHabitDto & {
        userId: number;
    }): any;
    update(id: number, userId: number, dto: UpdateHabitDto): Promise<any>;
    delete(id: number, userId: number): Promise<void>;
}
