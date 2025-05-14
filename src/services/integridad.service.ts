import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Sequelize } from 'sequelize';

@Injectable()
export class IntegridadService {

    private referenciaUrls: string[];

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
        @InjectConnection() private sequelize: Sequelize,
    ) {
        const raw = this.configService.get<string>('HOST_REFERENCIAS');
        this.referenciaUrls = raw?.split(',').map(url => url.trim()) || [];
    }

    async verifyExternalUuid(uuids: string[]): Promise<boolean> 
    {
        for (const baseUrl of this.referenciaUrls) {
            const response = await firstValueFrom(this.httpService.post(baseUrl, { json: uuids }).pipe(
                catchError((error: AxiosError) => {
                    const errorResponse = error.response?.data as { statusCode: number, message: string } | undefined;
                    return throwError(() => new HttpException(
                        errorResponse ? errorResponse : {
                            statusCode: 500,
                            message: 'Error en petición POST'
                        },
                        errorResponse?.statusCode ?? 500
                    ))
                })
            ));

            if (response.data?.inUse) {
                return true;
            }
        }

        return false;
    }


    async verifyInternalUuid(uuids: string[]) {
        const models = this.sequelize.models;

        for (const modelName of Object.keys(models)) {
            const model = models[modelName];
            const attributes = model.getAttributes();

            const uuidColumns = Object.values(attributes).map( att => att.field ?? '' )
                .filter( field => field.endsWith('_uuid') );

            for (const column of uuidColumns) {
                const record = await model.findOne({
                    where: {
                        [column]: uuids,
                    },
                    attributes: ['id'],
                });

                if (record) {
                    return {
                        inUse: true
                    };
                }
            }
        }

        return {
            inUse: false
        };
    }
}
