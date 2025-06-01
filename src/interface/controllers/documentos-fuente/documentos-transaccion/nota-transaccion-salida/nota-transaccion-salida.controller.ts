import { Cliente, NotaTransaccionSalida, Usuario } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NotaTransaccionSalidaService } from 'src/domain/application/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
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
    @Post('getCollectionByUsuarioUuid')
    async getCollectionByUsuarioUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getCollectionByUsuarioUuid( sessionData, new Usuario( sessionData.json ) );
    }


    @ApiBody({})
    @Post('getCollectionByClienteUuid')
    async getCollectionByClienteUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getCollectionByClienteUuid( sessionData, Cliente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.getObjectByUuid( sessionData, new NotaTransaccionSalida( sessionData.json ) );
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
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.notaTransaccionSalidaService.update( sessionData, new NotaTransaccionSalida( sessionData.json ) );
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