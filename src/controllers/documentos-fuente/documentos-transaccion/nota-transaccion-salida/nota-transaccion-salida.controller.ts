import { Cliente, NotaTransaccionSalida, Usuario } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { NotaTransaccionSalidaService } from 'src/repositories/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('notaTransaccionSalida')
export class NotaTransaccionSalidaController {

    constructor(
        private notaTransaccionSalidaService: NotaTransaccionSalidaService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getCollectionByUsuarioId')
    async getCollectionByUsuarioId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getCollectionByUsuarioId( sessionData, new Usuario( sessionData.json ) );
    }


    @ApiBody({})
    @Post('getCollectionByClienteId')
    async getCollectionByClienteId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getCollectionByClienteId( sessionData, Cliente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getObjectById( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.create( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Post('createAndIssue')
    async createAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.createAndIssue( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.update( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateAndIssue')
    async updateAndIssue(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.updateAndIssue( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Put('updateVoid')
    async updateVoid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.updateVoid( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.delete( sessionData, new NotaTransaccionSalida( sessionData.json ) );
    }
}