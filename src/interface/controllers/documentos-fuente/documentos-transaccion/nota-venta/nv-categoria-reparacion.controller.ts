import { NotaVentaCategoriaReparacion } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NvCategoriaReparacionService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('nvCategoriaReparacion')
export class NvCategoriaReparacionController {

    constructor(
        private nvCategoriaReparacionService: NvCategoriaReparacionService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.getObjectByUuid( sessionData, new NotaVentaCategoriaReparacion({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.create( sessionData, new NotaVentaCategoriaReparacion({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.update( sessionData, new NotaVentaCategoriaReparacion({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.delete( sessionData, new NotaVentaCategoriaReparacion({ ...sessionData.json }) );
    }
}