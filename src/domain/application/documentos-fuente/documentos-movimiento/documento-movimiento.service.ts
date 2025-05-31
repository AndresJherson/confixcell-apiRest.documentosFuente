import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteService } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoEntradaBienConsumo, DocumentoEntradaEfectivo, DocumentoMovimiento, DocumentoSalidaBienConsumo, DocumentoSalidaEfectivo } from '@confixcell/modelos';
import { DocumentoEntradaEfectivoService } from './entrada/documento-entrada-efectivo.service';
import { ERROR } from 'src/utils/constants';
import { DocumentoEntradaBienConsumoService } from './entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from './salida/documento-salida-bien-consumo.service';
import { DocumentoMovimientoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosMovimiento/DocumentoMovimientoOrm';

@Injectable()
export class DocumentoMovimientoService implements OnModuleInit {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoEntradaEfectivoService!: DocumentoEntradaEfectivoService;
    private documentoEntradaBienConsumoService!: DocumentoEntradaBienConsumoService;
    private documentoSalidaEfectivoService!: DocumentoSalidaEfectivoService;
    private documentoSalidaBienConsumoService!: DocumentoSalidaBienConsumoService;

    constructor(
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.documentoEntradaEfectivoService = this.moduleRef.get( DocumentoEntradaEfectivoService, { strict: false } );
        this.documentoEntradaBienConsumoService = this.moduleRef.get( DocumentoEntradaBienConsumoService, { strict: false } );
        this.documentoSalidaEfectivoService = this.moduleRef.get( DocumentoSalidaEfectivoService, { strict: false } );
        this.documentoSalidaBienConsumoService = this.moduleRef.get( DocumentoSalidaBienConsumoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoEntradaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoEntradaBienConsumoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoSalidaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoSalidaBienConsumoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        await this.documentoFuenteService.executeCreateCollection( s, documentosMovimiento );

        await DocumentoMovimientoOrm.bulkCreate( documentosMovimiento.map( doc => ({
            id: doc.id,
            documentoTransaccionId: doc.documentoTransaccion?.id
        }), ), {
            transaction: s.transaction
        } );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.documentoEntradaEfectivoService.getCollection( s );
        const data2 = await this.documentoEntradaBienConsumoService.getCollection( s );
        const data3 = await this.documentoSalidaEfectivoService.getCollection( s );
        const data4 = await this.documentoSalidaBienConsumoService.getCollection( s );

        return [ ...data1, ...data2, ...data3, ...data4 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectByUuid( s: SessionData, documentoMovimiento: DocumentoMovimiento )
    {
        try {
            return await this.documentoEntradaEfectivoService.getObjectByUuid( s, new DocumentoEntradaEfectivo({ ...documentoMovimiento }) );
        }
        catch ( error ) {
            try {
                return await this.documentoEntradaBienConsumoService.getObjectByUuid( s, new DocumentoEntradaBienConsumo({ ...documentoMovimiento }) );
            }
            catch ( error ) {
                try {
                    return await this.documentoSalidaEfectivoService.getObjectByUuid( s, new DocumentoSalidaEfectivo({ ...documentoMovimiento }) );
                }
                catch ( error ) {
                    return await this.documentoSalidaBienConsumoService.getObjectByUuid( s, new DocumentoSalidaBienConsumo({ ...documentoMovimiento }) );
                }
            }
        }
    }
}