import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const SessionDecorator = createParamDecorator(
    ( data: any, context: ExecutionContext ) => {
        const req = context.switchToHttp().getRequest();
        return req.sessionData;
    }
)