import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
     constructor(private jwtService : JwtService){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const { url, method } = request;     
        if ((url === '/auth/login' && method === 'POST') 
            || (url === '/auth/register' && method === 'POST')
            || (url === '/protected/hello' && method === 'GET')
        ) {
            return true;
        }

        const token =  this.extractTokenFromHeader(request);
        if(!token){
            throw new UnauthorizedException("Invalid token");
        }   

        try{ 
            const payload = this.jwtService.verify(token,);
            request.userId = payload.userId;
        }catch(e){
            Logger.error(e.message);
            throw new UnauthorizedException("Invalid token");
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers.authorization?.split(' ')[1];
    }
}
