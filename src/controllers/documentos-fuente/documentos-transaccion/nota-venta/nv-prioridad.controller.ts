import { NotaVentaPrioridad } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NvPrioridadService } from 'src/repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('nvPrioridad')
export class NvPrioridadController {

    constructor(
        private nvPrioridadService: NvPrioridadService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.getObjectById( sessionData, new NotaVentaPrioridad({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.create( sessionData, new NotaVentaPrioridad({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.update( sessionData, new NotaVentaPrioridad({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.delete( sessionData, new NotaVentaPrioridad({ ...sessionData.json }) );
    }
}