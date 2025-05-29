import { DocumentoFuente } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoFuenteService } from 'src/repositories/documentos-fuente/documento-fuente.service';
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
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoFuenteService.getObjectById( sessionData, DocumentoFuente.initialize([ sessionData.json ])[0] );
    }
}