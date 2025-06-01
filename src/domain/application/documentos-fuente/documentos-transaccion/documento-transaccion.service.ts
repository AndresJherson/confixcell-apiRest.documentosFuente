import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteService } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { Cliente, DocumentoTransaccion, NotaTransaccionEntrada, NotaTransaccionSalida, NotaVenta, Proveedor, Usuario } from '@confixcell/modelos';
import { DocumentoEntradaEfectivoService } from '../documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from '../documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from '../documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from '../documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { NotaTransaccionEntradaService } from './nota-transaccion-entrada/nota-transaccion-entrada.service';
import { NotaVentaService } from './nota-venta/nota-venta.service';
import { NotaTransaccionSalidaService } from './nota-transaccion-salida/nota-transaccion-salida.service';
import { DocumentoTransaccionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionOrm';

@Injectable()
export class DocumentoTransaccionService {

    private documentoFuenteService!: DocumentoFuenteService;
    private notaTransaccionEntradaService!: NotaTransaccionEntradaService;
    private notaTransaccionSalidaService!: NotaTransaccionSalidaService;
    private notaVentaService!: NotaVentaService;

    private documentoEntradaEfectivoService!: DocumentoEntradaEfectivoService;
    private documentoEntradaBienConsumoService!: DocumentoEntradaBienConsumoService;
    private documentoSalidaEfectivoService!: DocumentoSalidaEfectivoService;
    private documentoSalidaBienConsumoService!: DocumentoSalidaBienConsumoService;


    constructor(
        private moduleRef: ModuleRef,
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.notaTransaccionEntradaService = this.moduleRef.get( NotaTransaccionEntradaService, { strict: false } );
        this.notaTransaccionSalidaService = this.moduleRef.get( NotaTransaccionSalidaService, { strict: false } );
        this.notaVentaService = this.moduleRef.get( NotaVentaService, { strict: false } );

        this.documentoEntradaEfectivoService = this.moduleRef.get( DocumentoEntradaEfectivoService, { strict: false } );
        this.documentoEntradaBienConsumoService = this.moduleRef.get( DocumentoEntradaBienConsumoService, { strict: false } );
        this.documentoSalidaEfectivoService = this.moduleRef.get( DocumentoSalidaEfectivoService, { strict: false } );
        this.documentoSalidaBienConsumoService = this.moduleRef.get( DocumentoSalidaBienConsumoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( `${DocumentoFuenteService.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionEntradaService ) throw new InternalServerErrorException( `${NotaTransaccionEntradaService.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionSalidaService ) throw new InternalServerErrorException( `${NotaTransaccionSalidaService.name} NO PROPORCIONADO` );
        if ( !this.notaVentaService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );

        if ( !this.documentoEntradaEfectivoService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );
        if ( !this.documentoEntradaBienConsumoService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );
        if ( !this.documentoSalidaEfectivoService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );
        if ( !this.documentoEntradaBienConsumoService ) throw new InternalServerErrorException( `${NotaVentaService.name} NO PROPORCIONADO` );
    }


    async executeCreateCollection( s: SessionData, items: DocumentoTransaccion[], withSupertype: boolean = true )
    {
        if ( withSupertype )
            await this.documentoFuenteService.executeCreateCollection( s, items );

        await DocumentoTransaccionOrm.bulkCreate( items.map( item => ({
            id: item.id
        }) ), {
            transaction: s.transaction
        } );

        await this.documentoEntradaEfectivoService.executeCreateCollection( s, items.flatMap( item => item.docsEntradaEfectivo ) );
        await this.documentoEntradaBienConsumoService.executeCreateCollection( s, items.flatMap( item => item.docsEntradaBienConsumo ) );
        await this.documentoSalidaEfectivoService.executeCreateCollection( s, items.flatMap( item => item.docsSalidaEfectivo ) );
        await this.documentoSalidaBienConsumoService.executeCreateCollection( s, items.flatMap( item => item.docsSalidaBienConsumo ) );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollection( s );
        const data2 = await this.notaTransaccionSalidaService.getCollection( s );
        const data3 = await this.notaVentaService.getCollection( s );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByUsuarioUuid( s: SessionData, usuario: Usuario )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollectionByUsuarioUuid( s, new Usuario( usuario ) );
        const data2 = await this.notaTransaccionSalidaService.getCollectionByUsuarioUuid( s, new Usuario( usuario ) );
        const data3 = await this.notaVentaService.getCollectionByUsuarioUuid( s, new Usuario( usuario ) );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByClienteUuid( s: SessionData, cliente: Cliente )
    {
        const data1 = await this.notaTransaccionSalidaService.getCollectionByClienteUuid( s, Cliente.initialize([ cliente ])[0] );
        const data2 = await this.notaVentaService.getCollectionByClienteUuid( s, Cliente.initialize([ cliente ])[0] );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByProveedorUuid( s: SessionData, proveedor: Proveedor )
    {
        const data1 = await this.notaTransaccionEntradaService.getCollectionByProveedorUuid( s, Proveedor.initialize([ proveedor ])[0] );

        return [ ...data1 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectByUuid( s: SessionData, documentoTransaccion: DocumentoTransaccion )
    {
        try {
            return await this.notaTransaccionEntradaService.getObjectByUuid( s, new NotaTransaccionEntrada({ ...documentoTransaccion }) );
        }
        catch ( error ) {
            try {
                return await this.notaTransaccionSalidaService.getObjectByUuid( s, new NotaTransaccionSalida({ ...documentoTransaccion }) );
            }
            catch ( error ) {
                return await this.notaVentaService.getObjectByUuid( s, new NotaVenta({ ...documentoTransaccion }) );
            }
        }
    }
}