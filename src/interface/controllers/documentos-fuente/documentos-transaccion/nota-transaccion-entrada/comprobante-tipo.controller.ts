import { ComprobanteTipo } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ComprobanteTipoService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('comprobanteTipo')
export class ComprobanteTipoController {

    constructor(
        private comprobanteTipoService: ComprobanteTipoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.comprobanteTipoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.comprobanteTipoService.getObjectByUuid( sessionData, new ComprobanteTipo({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.comprobanteTipoService.create( sessionData, new ComprobanteTipo({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.comprobanteTipoService.update( sessionData, new ComprobanteTipo({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.comprobanteTipoService.delete( sessionData, new ComprobanteTipo({ ...sessionData.json }) );
    }
}