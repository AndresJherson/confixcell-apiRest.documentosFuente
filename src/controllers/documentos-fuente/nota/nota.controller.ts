import { DocumentoFuente, Nota } from '@confixcell/modelos';
import { Controller, Delete, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NotaService } from 'src/repositories/documentos-fuente/nota/nota.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('nota')
export class NotaController {

    constructor(
        private notaService: NotaService
    )
    {}


    @ApiBody({})
    @Post('getCollectionByDocumentoId')
    async getCollectionByDocumentoId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.getCollectionByDocumentoId( sessionData, DocumentoFuente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaService.getObjectById( sessionData, new Nota({ ...sessionData.json }) );
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