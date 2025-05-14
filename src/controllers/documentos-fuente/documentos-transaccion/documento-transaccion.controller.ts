import { Cliente, DocumentoTransaccion, Proveedor, Usuario } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { DocumentoTransaccionService } from 'src/repositories/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('documentoTransaccion')
export class DocumentoTransaccionController {

    constructor(
        private documentoTransaccionService: DocumentoTransaccionService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getCollectionByUsuarioId')
    async getCollectionByUsuarioId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByUsuarioId( sessionData, new Usuario( sessionData.json )[0] );
    }


    @ApiBody({})
    @Post('getCollectionByClienteId')
    async getCollectionByClienteId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByClienteId( sessionData, Cliente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getCollectionByProveedorId')
    async getCollectionByProveedorId(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByProveedorId( sessionData, Proveedor.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getObjectById( sessionData, DocumentoTransaccion.initialize([ sessionData.json ])[0] );
    }
}
