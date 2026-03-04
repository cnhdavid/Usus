import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: number): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(dto: CreateUserDto): Promise<any>;
    update(id: number, dto: UpdateUserDto): Promise<any>;
    delete(id: number): Promise<void>;
    toResponse(user: {
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    }): {
        id: number;
        username: string;
        email: string;
        createdAt: Date;
    };
}
