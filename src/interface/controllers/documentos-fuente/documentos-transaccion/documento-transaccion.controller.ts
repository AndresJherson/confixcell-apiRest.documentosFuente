import { Cliente, DocumentoTransaccion, Proveedor, Usuario } from '@confixcell/modelos';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DocumentoTransaccionService } from 'src/domain/application/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
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
    @Post('getCollectionByUsuarioUuid')
    async getCollectionByUsuarioUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByUsuarioUuid( sessionData, new Usuario( sessionData.json )[0] );
    }


    @ApiBody({})
    @Post('getCollectionByClienteUuid')
    async getCollectionByClienteUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByClienteUuid( sessionData, Cliente.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getCollectionByProveedorUuid')
    async getCollectionByProveedorUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getCollectionByProveedorUuid( sessionData, Proveedor.initialize([ sessionData.json ])[0] );
    }


    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.documentoTransaccionService.getObjectByUuid( sessionData, DocumentoTransaccion.initialize([ sessionData.json ])[0] );
    }
}
