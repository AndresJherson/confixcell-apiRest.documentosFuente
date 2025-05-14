import { DocumentoMovimiento } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoMovimientoService } from 'src/repositories/documentos-fuente/documentos-movimiento/documento-movimiento.service';
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
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoMovimientoService.getObjectById( sessionData, DocumentoMovimiento.initialize([ sessionData.json ])[0] );
    }
}
