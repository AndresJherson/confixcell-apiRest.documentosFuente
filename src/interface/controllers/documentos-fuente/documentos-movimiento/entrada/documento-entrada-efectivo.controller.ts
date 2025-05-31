import { DocumentoEntradaEfectivo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DocumentoEntradaEfectivoService } from 'src/domain/application/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoEntradaEfectivo')
export class DocumentoEntradaEfectivoController {

    constructor(
        private documentoEntradaEfectivoService: DocumentoEntradaEfectivoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.getObjectByUuid( sessionData, new DocumentoEntradaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.createAndIssue( sessionData, new DocumentoEntradaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.updateVoid( sessionData, new DocumentoEntradaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.delete( sessionData, new DocumentoEntradaEfectivo( sessionData.json ) );
    }
}