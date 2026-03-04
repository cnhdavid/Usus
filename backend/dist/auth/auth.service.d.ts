import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    validateUser(email: string, password: string): Promise<any>;
}
