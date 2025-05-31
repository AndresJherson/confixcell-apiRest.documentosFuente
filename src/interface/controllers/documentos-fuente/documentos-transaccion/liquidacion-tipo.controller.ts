import { LiquidacionTipo } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LiquidacionTipoService } from 'src/domain/application/documentos-fuente/liquidacion-tipo.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('liquidacionTipo')
export class LiquidacionTipoController {

    constructor(
        private liquidacionTipoService: LiquidacionTipoService
    )
    {}

    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.liquidacionTipoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.liquidacionTipoService.getObjectByUuid( sessionData, new LiquidacionTipo({ ...sessionData.json }) );
    }
}