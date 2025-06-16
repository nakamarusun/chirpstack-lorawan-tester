import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { isObservable, Observable, take } from "rxjs";
import { CustomJwtPayload } from "src/models/auth";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super();
  }

  private async checkPrivileges(context: ExecutionContext): Promise<boolean> {
    // Check if the user in the parameter is privileged to do this
    const request = context.switchToHttp().getRequest();
    const user: CustomJwtPayload | undefined = request.user;
    if (!user) return false;

    return true;
  }

  private async canActivateUtil(context: ExecutionContext, result: boolean) {
    if (result) {
      return await this.checkPrivileges(context);
    } else {
      return false;
    }
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result.then((res) => this.canActivateUtil(context, res));
    }

    if (isObservable(result)) {
      return new Promise((resolve) => {
        (result as Observable<boolean>)
          .pipe(take(1))
          .subscribe((res) => resolve(this.canActivateUtil(context, res)));
      });
    }

    return this.canActivateUtil(context, result as boolean);
  }
}
