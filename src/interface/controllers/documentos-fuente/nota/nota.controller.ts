import { DocumentoFuente, Nota } from '@confixcell/modelos';
import { Controller, Delete, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NotaService } from 'src/domain/application/documentos-fuente/nota/nota.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('nota')
export class NotaController {

    constructor(
        private notaService: NotaService
    )
    {}


    @ApiBody({})
    @Post('getCollectionByDocumentoUuid')
    async getCollectionByDocumentoUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.getCollectionByDocumentoUuid( sessionData, DocumentoFuente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.getObjectByUuid( sessionData, new Nota({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.create( sessionData, new Nota({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.delete( sessionData, new Nota({ ...sessionData.json }) );
    }
}