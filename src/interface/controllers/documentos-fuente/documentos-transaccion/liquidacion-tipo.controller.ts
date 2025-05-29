import { LiquidacionTipo } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { LiquidacionTipoService } from 'src/repositories/documentos-fuente/liquidacion-tipo.service';
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
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.liquidacionTipoService.getObjectById( sessionData, new LiquidacionTipo({ ...sessionData.json }) );
    }
}