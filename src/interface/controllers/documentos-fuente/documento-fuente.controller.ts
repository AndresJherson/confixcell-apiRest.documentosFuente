import { DocumentoFuente } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DocumentoFuenteService } from 'src/domain/application/documentos-fuente/documento-fuente.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoFuente')
export class DocumentoFuenteController {

    constructor(
        private documentoFuenteService: DocumentoFuenteService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoFuenteService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoFuenteService.getObjectByUuid( sessionData, DocumentoFuente.initialize([ sessionData.json ])[0] );
    }
}