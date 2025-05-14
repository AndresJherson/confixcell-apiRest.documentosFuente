import { DocumentoSalidaEfectivo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoSalidaEfectivoService } from 'src/repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoSalidaEfectivo')
export class DocumentoSalidaEfectivoController {

    constructor(
        private documentoSalidaEfectivoService: DocumentoSalidaEfectivoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaEfectivoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaEfectivoService.getObjectById( sessionData, new DocumentoSalidaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaEfectivoService.createAndIssue( sessionData, new DocumentoSalidaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaEfectivoService.updateVoid( sessionData, new DocumentoSalidaEfectivo( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoSalidaEfectivoService.delete( sessionData, new DocumentoSalidaEfectivo( sessionData.json ) );
    }
}
