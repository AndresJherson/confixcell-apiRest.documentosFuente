import { NotaVentaCategoriaReparacion } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NvCategoriaReparacionService } from 'src/repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
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
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvCategoriaReparacionService.getObjectById( sessionData, new NotaVentaCategoriaReparacion({ ...sessionData.json }) );
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