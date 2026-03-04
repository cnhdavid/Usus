import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(req: Request): Promise<{
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    }>;
    getUser(id: number): Promise<{
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    }>;
    signup(dto: CreateUserDto, req: Request): Promise<{
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    }>;
    login(req: Request): {
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    };
    logout(req: Request): Promise<{
        message: string;
    }>;
    updateUser(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    }>;
    deleteUser(id: number): Promise<void>;
}
