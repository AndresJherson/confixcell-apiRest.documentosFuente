import { NotaVentaPrioridad } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NvPrioridadService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
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
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.nvPrioridadService.getObjectByUuid( sessionData, new NotaVentaPrioridad({ ...sessionData.json }) );
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