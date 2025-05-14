import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteService } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { Cliente, DocumentoTransaccion, NotaTransaccionEntrada, NotaTransaccionSalida, NotaVenta, Proveedor, Usuario } from '@confixcell/modelos';
import { DocumentoEntradaEfectivoService } from '../documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from '../documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from '../documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from '../documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoTransaccionEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionEntity';
import { NotaTransaccionEntradaService } from './nota-transaccion-entrada/nota-transaccion-entrada.service';
import { NotaVentaService } from './nota-venta/nota-venta.service';
import { NotaTransaccionSalidaService } from './nota-transaccion-salida/nota-transaccion-salida.service';

@Injectable()
export class DocumentoTransaccionService {

    private documentoFuenteService!: DocumentoFuenteService;
    private notaTransaccionEntradaService!: NotaTransaccionEntradaService;
    private notaTransaccionSalidaService!: NotaTransaccionSalidaService;
    private notaVentaService!: NotaVentaService;


    constructor(
        private moduleRef: ModuleRef,
        private documentoEntradaEfectivoService: DocumentoEntradaEfectivoService,
        private documentoEntradaBienConsumoService: DocumentoEntradaBienConsumoService,
        private documentoSalidaEfectivoService: DocumentoSalidaEfectivoService,
        private documentoSalidaBienConsumoService: DocumentoSalidaBienConsumoService
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.notaTransaccionEntradaService = this.moduleRef.get( NotaTransaccionEntradaService, { strict: false } );
        this.notaTransaccionSalidaService = this.moduleRef.get( NotaTransaccionSalidaService, { strict: false } );
        this.notaVentaService = this.moduleRef.get( NotaVentaService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( `${DocumentoFuenteService.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionEntradaService ) throw new InternalServerErrorException( `${NotaTransaccionEntradaService.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionSalidaService ) throw new InternalServerErrorException( `${NotaTransaccionSalidaService.name} NO PROPORCIONADO` );
        if ( !this.notaVentaService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );
    }


    async executeCreateCollection( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        await this.documentoFuenteService.executeCreateCollection( s, documentosTransaccion );

        await DocumentoTransaccionEntity.bulkCreate( documentosTransaccion.map( doc => ({
            id: doc.id,
            fechaCreacion: doc.fechaCreacion,
            fechaActualizacion: doc.fechaActualizacion,
            concepto: doc.concepto
        }) ) );

        await this.documentoEntradaEfectivoService.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsEntradaEfectivo ) );
        await this.documentoEntradaBienConsumoService.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsEntradaBienConsumo ) );
        await this.documentoSalidaEfectivoService.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsSalidaEfectivo ) );
        await this.documentoSalidaBienConsumoService.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsSalidaBienConsumo ) );
    }


    async executeDeleteCollection( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        return await this.documentoFuenteService.executeDeleteCollection( s, documentosTransaccion );
    }


    async setCode( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        return await this.documentoFuenteService.setCode( s, documentosTransaccion );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollection( s );
        const data2 = await this.notaTransaccionSalidaService.getCollection( s );
        const data3 = await this.notaVentaService.getCollection( s );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByUsuarioId( s: SessionData, usuario: Usuario )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollectionByUsuarioId( s, new Usuario( usuario ) );
        const data2 = await this.notaTransaccionSalidaService.getCollectionByUsuarioId( s, new Usuario( usuario ) );
        const data3 = await this.notaVentaService.getCollectionByUsuarioId( s, new Usuario( usuario ) );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByClienteId( s: SessionData, cliente: Cliente )
    {
        const data1 = await this.notaTransaccionSalidaService.getCollectionByClienteId( s, Cliente.initialize([ cliente ])[0] );
        const data2 = await this.notaVentaService.getCollectionByClienteId( s, Cliente.initialize([ cliente ])[0] );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByProveedorId( s: SessionData, proveedor: Proveedor )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollectionByProveedorId( s, Proveedor.initialize([ proveedor ])[0] );

        return [ ...data1 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoTransaccion: DocumentoTransaccion )
    {
        try {
            return await this.notaTransaccionEntradaService.getObjectById( s, new NotaTransaccionEntrada({ ...documentoTransaccion }) );
        }
        catch ( error ) {
            try {
                return await this.notaTransaccionSalidaService.getObjectById( s, new NotaTransaccionSalida({ ...documentoTransaccion }) );
            }
            catch ( error ) {
                return await this.notaVentaService.getObjectById( s, new NotaVenta({ ...documentoTransaccion }) );
            }
        }
    }


    async updateVoid( s: SessionData, documentoTransaccion: DocumentoTransaccion )
    {
        return await this.documentoFuenteService.updateVoid( s, documentoTransaccion );
    }
}