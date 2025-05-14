import { DocumentoEntradaBienConsumo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoEntradaBienConsumoService } from 'src/repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoEntradaBienConsumo')
export class DocumentoEntradaBienConsumoController {

    constructor(
        private documentoEntradaBienConsumoService: DocumentoEntradaBienConsumoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaBienConsumoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaBienConsumoService.getObjectById( sessionData, new DocumentoEntradaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaBienConsumoService.createAndIssue( sessionData, new DocumentoEntradaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaBienConsumoService.updateVoid( sessionData, new DocumentoEntradaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoEntradaBienConsumoService.delete( sessionData, new DocumentoEntradaBienConsumo( sessionData.json ) );
    }
}