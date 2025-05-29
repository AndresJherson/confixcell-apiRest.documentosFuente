import { NotaTransaccionEntrada, Proveedor, Usuario } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NotaTransaccionEntradaService } from 'src/repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
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
    @Post('getCollectionByUsuarioId')
    async getCollectionByUsuarioId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getCollectionByUsuarioId( sessionData, new Usuario( sessionData.json ) );
    }


    @ApiBody({})
    @Post('getCollectionByProveedorId')
    async getCollectionByProveedorId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getCollectionByProveedorId( sessionData, Proveedor.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionEntradaService.getObjectById( sessionData, new NotaTransaccionEntrada( sessionData.json ) );
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