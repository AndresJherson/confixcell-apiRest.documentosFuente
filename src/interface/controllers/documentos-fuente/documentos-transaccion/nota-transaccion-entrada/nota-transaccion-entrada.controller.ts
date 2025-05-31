import { NotaTransaccionEntrada, Proveedor, Usuario } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NotaTransaccionEntradaService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('notaTransaccionEntrada')
export class NotaTransaccionEntradaController {

    constructor(
        private notaTransaccionEntradaService: NotaTransaccionEntradaService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getCollectionByUsuarioUuid')
    async getCollectionByUsuarioUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getCollectionByUsuarioUuid( sessionData, new Usuario( sessionData.json ) );
    }


    @ApiBody({})
    @Post('getCollectionByProveedorUuid')
    async getCollectionByProveedorUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getCollectionByProveedorUuid( sessionData, Proveedor.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getObjectByUuid( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.create( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.createAndIssue( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.update( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateAndIssue')
    async updateAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.updateAndIssue( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateCancel(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.updateVoid( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.delete( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
    }
}