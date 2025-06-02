import { BienConsumo } from '@confixcell/modelos';
import { Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { EntradaBienConsumoService } from 'src/domain/application/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('entradaBienConsumo')
export class EntradaBienConsumoController {

    constructor(
        private entradaBienConsumoService: EntradaBienConsumoService
    )
    {}


    @ApiBody({})
    @Post('getCollectionByBienConsumoUuid')
    async getCollectionByBienConsumoUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.entradaBienConsumoService.getCollectionByBienConsumoUuid( sessionData, BienConsumo.initialize([ sessionData.json ])[0] );
    }
}
