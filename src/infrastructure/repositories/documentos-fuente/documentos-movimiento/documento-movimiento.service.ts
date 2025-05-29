import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteRepository } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoEntradaBienConsumo, DocumentoEntradaEfectivo, DocumentoMovimiento, DocumentoSalidaBienConsumo, DocumentoSalidaEfectivo } from '@confixcell/modelos';
import { DocumentoEntradaEfectivoRepository } from './entrada/documento-entrada-efectivo.service';
import { ERROR } from 'src/utils/constants';
import { DocumentoEntradaBienConsumoRepository } from './entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoRepository } from './salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoRepository } from './salida/documento-salida-bien-consumo.service';
import { DocumentoMovimientoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosMovimiento/DocumentoMovimientoOrm';

@Injectable()
export class DocumentoMovimientoRepository implements OnModuleInit {

    private documentoFuenteRepository!: DocumentoFuenteRepository;
    private documentoEntradaEfectivoRepository!: DocumentoEntradaEfectivoRepository;
    private documentoEntradaBienConsumoRepository!: DocumentoEntradaBienConsumoRepository;
    private documentoSalidaEfectivoRepository!: DocumentoSalidaEfectivoRepository;
    private documentoSalidaBienConsumoRepository!: DocumentoSalidaBienConsumoRepository;


    constructor(
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteRepository = this.moduleRef.get( DocumentoFuenteRepository, { strict: false } );
        this.documentoEntradaEfectivoRepository = this.moduleRef.get( DocumentoEntradaEfectivoRepository, { strict: false } );
        this.documentoEntradaBienConsumoRepository = this.moduleRef.get( DocumentoEntradaBienConsumoRepository, { strict: false } );
        this.documentoSalidaEfectivoRepository = this.moduleRef.get( DocumentoSalidaEfectivoRepository, { strict: false } );
        this.documentoSalidaBienConsumoRepository = this.moduleRef.get( DocumentoSalidaBienConsumoRepository, { strict: false } );

        if ( !this.documentoFuenteRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoEntradaEfectivoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoEntradaBienConsumoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoSalidaEfectivoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoSalidaBienConsumoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        await this.documentoFuenteRepository.executeCreateCollection( s, documentosMovimiento );

        await DocumentoMovimientoOrm.bulkCreate( documentosMovimiento.map( doc => ({
            id: doc.id,
            documentoTransaccionId: doc.documentoTransaccion?.id
        }), ), {
            transaction: s.transaction
        } );
    }


    async executeDeleteCollection( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        return await this.documentoFuenteRepository.executeDeleteCollection( s, documentosMovimiento );
    }


    async setCode( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        return await this.documentoFuenteRepository.setCode( s, documentosMovimiento );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.documentoEntradaEfectivoRepository.getCollection( s );
        const data2 = await this.documentoEntradaBienConsumoRepository.getCollection( s );
        const data3 = await this.documentoSalidaEfectivoRepository.getCollection( s );
        const data4 = await this.documentoSalidaBienConsumoRepository.getCollection( s );

        return [ ...data1, ...data2, ...data3, ...data4 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoMovimiento: DocumentoMovimiento )
    {
        try {
            return await this.documentoEntradaEfectivoRepository.getObjectById( s, new DocumentoEntradaEfectivo({ ...documentoMovimiento }) );
        }
        catch ( error ) {
            try {
                return await this.documentoEntradaBienConsumoRepository.getObjectById( s, new DocumentoEntradaBienConsumo({ ...documentoMovimiento }) );
            }
            catch ( error ) {
                try {
                    return await this.documentoSalidaEfectivoRepository.getObjectById( s, new DocumentoSalidaEfectivo({ ...documentoMovimiento }) );
                }
                catch ( error ) {
                    return await this.documentoSalidaBienConsumoRepository.getObjectById( s, new DocumentoSalidaBienConsumo({ ...documentoMovimiento }) );
                }
            }
        }
    }


    async updateVoid( s: SessionData, documentoMovimiento: DocumentoMovimiento )
    {
        return await this.documentoFuenteRepository.updateVoid( s, documentoMovimiento );
    }
}