import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteRepository } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { Cliente, DocumentoTransaccion, NotaTransaccionEntrada, NotaTransaccionSalida, NotaVenta, Proveedor, Usuario } from '@confixcell/modelos';
import { DocumentoEntradaEfectivoRepository } from '../documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoRepository } from '../documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoRepository } from '../documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoRepository } from '../documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { NotaTransaccionEntradaRepository } from './nota-transaccion-entrada/nota-transaccion-entrada.service';
import { NotaVentaRepository } from './nota-venta/nota-venta.service';
import { NotaTransaccionSalidaRepository } from './nota-transaccion-salida/nota-transaccion-salida.service';
import { DocumentoTransaccionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionOrm';

@Injectable()
export class DocumentoTransaccionRepository {

    private documentoFuenteRepository!: DocumentoFuenteRepository;
    private notaTransaccionEntradaRepository!: NotaTransaccionEntradaRepository;
    private notaTransaccionSalidaRepository!: NotaTransaccionSalidaRepository;
    private notaVentaRepository!: NotaVentaRepository;


    constructor(
        private moduleRef: ModuleRef,
        private documentoEntradaEfectivoRepository: DocumentoEntradaEfectivoRepository,
        private documentoEntradaBienConsumoRepository: DocumentoEntradaBienConsumoRepository,
        private documentoSalidaEfectivoRepository: DocumentoSalidaEfectivoRepository,
        private documentoSalidaBienConsumoRepository: DocumentoSalidaBienConsumoRepository
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteRepository = this.moduleRef.get( DocumentoFuenteRepository, { strict: false } );
        this.notaTransaccionEntradaRepository = this.moduleRef.get( NotaTransaccionEntradaRepository, { strict: false } );
        this.notaTransaccionSalidaRepository = this.moduleRef.get( NotaTransaccionSalidaRepository, { strict: false } );
        this.notaVentaRepository = this.moduleRef.get( NotaVentaRepository, { strict: false } );

        if ( !this.documentoFuenteRepository ) throw new InternalServerErrorException( `${DocumentoFuenteRepository.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionEntradaRepository ) throw new InternalServerErrorException( `${NotaTransaccionEntradaRepository.name} NO PROPORCIONADO` );
        if ( !this.notaTransaccionSalidaRepository ) throw new InternalServerErrorException( `${NotaTransaccionSalidaRepository.name} NO PROPORCIONADO` );
        if ( !this.notaVentaRepository ) throw new InternalServerErrorException( `${NotaVentaRepository.name} NO PROPORCIONADO` );
    }


    async executeCreateCollection( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        await this.documentoFuenteRepository.executeCreateCollection( s, documentosTransaccion );

        await DocumentoTransaccionOrm.bulkCreate( documentosTransaccion.map( doc => ({
            id: doc.id,
            fechaCreacion: doc.fechaCreacion,
            fechaActualizacion: doc.fechaActualizacion,
            concepto: doc.concepto
        }) ), {
            transaction: s.transaction
        } );

        await this.documentoEntradaEfectivoRepository.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsEntradaEfectivo ) );
        await this.documentoEntradaBienConsumoRepository.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsEntradaBienConsumo ) );
        await this.documentoSalidaEfectivoRepository.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsSalidaEfectivo ) );
        await this.documentoSalidaBienConsumoRepository.executeCreateCollection( s, documentosTransaccion.flatMap( doc => doc.docsSalidaBienConsumo ) );
    }


    async executeDeleteCollection( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        return await this.documentoFuenteRepository.executeDeleteCollection( s, documentosTransaccion );
    }


    async setCode( s: SessionData, documentosTransaccion: DocumentoTransaccion[] )
    {
        return await this.documentoFuenteRepository.setCode( s, documentosTransaccion );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.notaTransaccionEntradaRepository.getCollection( s );
        const data2 = await this.notaTransaccionSalidaRepository.getCollection( s );
        const data3 = await this.notaVentaRepository.getCollection( s );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByUsuarioId( s: SessionData, usuario: Usuario )
    {
        const data1 = await this.notaTransaccionEntradaRepository.getCollectionByUsuarioId( s, new Usuario( usuario ) );
        const data2 = await this.notaTransaccionSalidaRepository.getCollectionByUsuarioId( s, new Usuario( usuario ) );
        const data3 = await this.notaVentaRepository.getCollectionByUsuarioId( s, new Usuario( usuario ) );

        return [ ...data1, ...data2, ...data3 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByClienteId( s: SessionData, cliente: Cliente )
    {
        const data1 = await this.notaTransaccionSalidaRepository.getCollectionByClienteId( s, Cliente.initialize([ cliente ])[0] );
        const data2 = await this.notaVentaRepository.getCollectionByClienteId( s, Cliente.initialize([ cliente ])[0] );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getCollectionByProveedorId( s: SessionData, proveedor: Proveedor )
    {
        const data1 = await this.notaTransaccionEntradaRepository.getCollectionByProveedorId( s, Proveedor.initialize([ proveedor ])[0] );

        return [ ...data1 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoTransaccion: DocumentoTransaccion )
    {
        try {
            return await this.notaTransaccionEntradaRepository.getObjectById( s, new NotaTransaccionEntrada({ ...documentoTransaccion }) );
        }
        catch ( error ) {
            try {
                return await this.notaTransaccionSalidaRepository.getObjectById( s, new NotaTransaccionSalida({ ...documentoTransaccion }) );
            }
            catch ( error ) {
                return await this.notaVentaRepository.getObjectById( s, new NotaVenta({ ...documentoTransaccion }) );
            }
        }
    }


    async updateVoid( s: SessionData, documentoTransaccion: DocumentoTransaccion )
    {
        return await this.documentoFuenteRepository.updateVoid( s, documentoTransaccion );
    }
}