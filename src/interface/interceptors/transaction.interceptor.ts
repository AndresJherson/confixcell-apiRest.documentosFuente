import { Prop, Usuario } from '@confixcell/modelos';
import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { ConectorService } from 'src/services/conector.service';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {

    constructor(
        private conectorService: ConectorService
    )
    {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const ctx = context.switchToHttp();
        const req: Request = ctx.getRequest();
        const res = ctx.getResponse();
        const body = Prop.setObject( req.body );

        return from( this.conectorService.beginTransaction() ).pipe(
            switchMap( t => {

                const sessionData: SessionData = {
                    req,
                    res,
                    json: body.json,
                    transaction: t,
                    usuarioSession: new Usuario( body.usuarioSession )
                }

                req['sessionData'] = sessionData;

                return next.handle().pipe(
                    switchMap( response => from( t.commit() ).pipe(
                        map( () => response )
                    ) ),
                    catchError( error => {
                        console.log( `Error capturado en interceptor: ${error}` );
                        return from( t.rollback() ).pipe(
                            switchMap( () => throwError( () => new InternalServerErrorException( error.message ) ) )
                        )
                    } )
                )
            } )
        )
    }
}
