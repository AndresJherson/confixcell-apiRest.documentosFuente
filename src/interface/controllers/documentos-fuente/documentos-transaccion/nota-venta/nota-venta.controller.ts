import { Cliente, NotaVenta, Usuario } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NotaVentaService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('notaVenta')
export class NotaVentaController {

    constructor(
        private notaVentaService: NotaVentaService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getCollectionByUsuarioUuid')
    async getCollectionByUsuarioUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.getCollectionByUsuarioUuid( sessionData, new Usuario( sessionData.json ) );
    }


    @ApiBody({})
    @Post('getCollectionByClienteUuid')
    async getCollectionByClienteUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.getCollectionByClienteUuid( sessionData, Cliente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.getObjectByUuid( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.create( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.createAndIssue( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.update( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateAndIssue')
    async updateAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.updateAndIssue( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.updateVoid( sessionData, new NotaVenta( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaVentaService.delete( sessionData, new NotaVenta( sessionData.json ) );
    }
}