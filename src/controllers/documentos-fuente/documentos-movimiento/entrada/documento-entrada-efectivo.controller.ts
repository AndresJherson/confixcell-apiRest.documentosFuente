import { DocumentoEntradaEfectivo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoEntradaEfectivoService } from 'src/repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
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
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaEfectivoService.getObjectById( sessionData, new DocumentoEntradaEfectivo( sessionData.json ) );
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