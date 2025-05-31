import { DocumentoMovimiento } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DocumentoMovimientoService } from 'src/domain/application/documentos-fuente/documentos-movimiento/documento-movimiento.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoMovimiento')
export class DocumentoMovimientoController {

    constructor(
        private documentoMovimientoService: DocumentoMovimientoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoMovimientoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoMovimientoService.getObjectByUuid( sessionData, DocumentoMovimiento.initialize([ sessionData.json ])[0] );
    }
}
