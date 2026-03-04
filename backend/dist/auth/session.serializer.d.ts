import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
export declare class SessionSerializer extends PassportSerializer {
    private readonly usersService;
    constructor(usersService: UsersService);
    serializeUser(user: any, done: (err: any, id?: number) => void): void;
    deserializeUser(id: number, done: (err: any, user?: any) => void): Promise<void>;
}
