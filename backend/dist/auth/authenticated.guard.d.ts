import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
export declare class AuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
