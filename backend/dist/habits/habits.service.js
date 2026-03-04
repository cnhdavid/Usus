"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HabitsService = class HabitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllByUser(userId) {
        return this.prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async findById(id, userId) {
        const habit = await this.prisma.habit.findUnique({ where: { id } });
        if (!habit || habit.userId !== userId)
            throw new common_1.NotFoundException(`Habit with ID ${id} not found`);
        return habit;
    }
    create(dto) {
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
    async update(id, userId, dto) {
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
    async delete(id, userId) {
        await this.findById(id, userId);
        await this.prisma.habit.delete({ where: { id } });
    }
};
exports.HabitsService = HabitsService;
exports.HabitsService = HabitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HabitsService);
//# sourceMappingURL=habits.service.js.map