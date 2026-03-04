import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: any, id?: number) => void) {
    done(null, user.id);
  }

  async deserializeUser(id: number, done: (err: any, user?: any) => void) {
    try {
      const user = await this.usersService.findById(id);
      done(null, user);
    } catch {
      done(null, null);
    }
  }
}
