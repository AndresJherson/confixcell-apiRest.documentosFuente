import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DocumentoFuenteService } from '../documento-fuente.service';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoEntradaBienConsumo, DocumentoEntradaEfectivo, DocumentoMovimiento, DocumentoSalidaBienConsumo, DocumentoSalidaEfectivo } from '@confixcell/modelos';
import { DocumentoMovimientoEntity } from 'src/entities/DocumentosFuente/DocumentosMovimiento/DocumentoMovimientoEntity';
import { Op } from 'sequelize';
import { DocumentoEntradaEfectivoService } from './entrada/documento-entrada-efectivo.service';
import { ERROR } from 'src/utils/constants';
import { DocumentoEntradaBienConsumoService } from './entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from './salida/documento-salida-bien-consumo.service';

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

        await DocumentoMovimientoEntity.bulkCreate( documentosMovimiento.map( doc => ({
            id: doc.id,
            documentoTransaccionId: doc.documentoTransaccion?.id
        }) ) );
    }


    async executeDeleteCollection( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        return await this.documentoFuenteService.executeDeleteCollection( s, documentosMovimiento );
    }


    async setCode( s: SessionData, documentosMovimiento: DocumentoMovimiento[] )
    {
        return await this.documentoFuenteService.setCode( s, documentosMovimiento );
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.documentoEntradaEfectivoService.getCollection( s );
        const data2 = await this.documentoEntradaBienConsumoService.getCollection( s );
        const data3 = await this.documentoSalidaEfectivoService.getCollection( s );
        const data4 = await this.documentoSalidaBienConsumoService.getCollection( s );

        return [ ...data1, ...data2, ...data3, ...data4 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoMovimiento: DocumentoMovimiento )
    {
        try {
            return await this.documentoEntradaEfectivoService.getObjectById( s, new DocumentoEntradaEfectivo({ ...documentoMovimiento }) );
        }
        catch ( error ) {
            try {
                return await this.documentoEntradaBienConsumoService.getObjectById( s, new DocumentoEntradaBienConsumo({ ...documentoMovimiento }) );
            }
            catch ( error ) {
                try {
                    return await this.documentoSalidaEfectivoService.getObjectById( s, new DocumentoSalidaEfectivo({ ...documentoMovimiento }) );
                }
                catch ( error ) {
                    return await this.documentoSalidaBienConsumoService.getObjectById( s, new DocumentoSalidaBienConsumo({ ...documentoMovimiento }) );
                }
            }
        }
    }


    async updateVoid( s: SessionData, documentoMovimiento: DocumentoMovimiento )
    {
        return await this.documentoFuenteService.updateVoid( s, documentoMovimiento );
    }
}