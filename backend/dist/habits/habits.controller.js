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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitsController = void 0;
const common_1 = require("@nestjs/common");
const habits_service_1 = require("./habits.service");
const create_habit_dto_1 = require("./dto/create-habit.dto");
const update_habit_dto_1 = require("./dto/update-habit.dto");
const authenticated_guard_1 = require("../auth/authenticated.guard");
let HabitsController = class HabitsController {
    habitsService;
    constructor(habitsService) {
        this.habitsService = habitsService;
    }
    getUserId(req) {
        return req.user.id;
    }
    getHabits(req) {
        return this.habitsService.findAllByUser(this.getUserId(req));
    }
    getHabit(id, req) {
        return this.habitsService.findById(id, this.getUserId(req));
    }
    createHabit(dto, req) {
        return this.habitsService.create({ ...dto, userId: this.getUserId(req) });
    }
    updateHabit(id, dto, req) {
        return this.habitsService.update(id, this.getUserId(req), dto);
    }
    deleteHabit(id, req) {
        return this.habitsService.delete(id, this.getUserId(req));
    }
};
exports.HabitsController = HabitsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HabitsController.prototype, "getHabits", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HabitsController.prototype, "getHabit", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_habit_dto_1.CreateHabitDto, Object]),
    __metadata("design:returntype", void 0)
], HabitsController.prototype, "createHabit", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_habit_dto_1.UpdateHabitDto, Object]),
    __metadata("design:returntype", void 0)
], HabitsController.prototype, "updateHabit", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HabitsController.prototype, "deleteHabit", null);
exports.HabitsController = HabitsController = __decorate([
    (0, common_1.Controller)('api/habits'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [habits_service_1.HabitsService])
], HabitsController);
//# sourceMappingURL=habits.controller.js.map