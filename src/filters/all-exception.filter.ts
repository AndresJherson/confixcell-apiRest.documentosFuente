import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {

        const res: Response = host.switchToHttp().getResponse()

        const statusCode = exception instanceof HttpException
                        ? exception.getStatus()
                        : 500;

        const message = exception instanceof HttpException
                            ? exception.message
                        : ( exception as any ).message !== undefined
                            ? String( ( exception as any ).message )
                        : 'Error en servicio de Documentos Fuente';

        res.status( statusCode )
        .statusMessage = message;

        res.json({
            statusCode,
            message
        })

    }
}
