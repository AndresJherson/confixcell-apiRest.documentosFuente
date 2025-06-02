import { BienConsumo } from '@confixcell/modelos';
import { Controller, Post } from '@nestjs/common';
import { SalidaBienConsumoService } from 'src/domain/application/movimientos-recurso/salida/salida-bien-consumo.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';
import { ApiBody } from '@nestjs/swagger';

@Controller('salidaBienConsumo')
export class SalidaBienConsumoController {

    constructor(
        private salidaBienConsumoService: SalidaBienConsumoService
    )
    {}


    @ApiBody({})
    @Post('getCollectionByBienConsumoUuid')
    async getCollectionByBienConsumoUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.salidaBienConsumoService.getCollectionByBienConsumoUuid( sessionData, BienConsumo.initialize([ sessionData.json ])[0] );
    }
}
