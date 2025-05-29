import { DocumentoSalidaBienConsumo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoSalidaBienConsumoService } from 'src/repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoSalidaBienConsumo')
export class DocumentoSalidaBienConsumoController {

    constructor(
        private documentoSalidaBienConsumoService: DocumentoSalidaBienConsumoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaBienConsumoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaBienConsumoService.getObjectById( sessionData, new DocumentoSalidaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaBienConsumoService.createAndIssue( sessionData, new DocumentoSalidaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaBienConsumoService.updateVoid( sessionData, new DocumentoSalidaBienConsumo( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaBienConsumoService.delete( sessionData, new DocumentoSalidaBienConsumo( sessionData.json ) );
    }
}