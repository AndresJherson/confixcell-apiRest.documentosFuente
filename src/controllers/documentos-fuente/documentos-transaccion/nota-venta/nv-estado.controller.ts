import { NotaVentaEstado } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NvEstadoService } from 'src/repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('nvEstado')
export class NvEstadoController {

    constructor(
        private nvEstadoService: NvEstadoService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvEstadoService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvEstadoService.getObjectById( sessionData, new NotaVentaEstado({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvEstadoService.create( sessionData, new NotaVentaEstado({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvEstadoService.update( sessionData, new NotaVentaEstado({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvEstadoService.delete( sessionData, new NotaVentaEstado({ ...sessionData.json }) );
    }
}