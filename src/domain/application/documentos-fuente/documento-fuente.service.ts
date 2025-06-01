import { DocumentoFuente, DocumentoMovimiento, DocumentoTransaccion } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ERROR } from 'src/utils/constants';
import { Transaction } from 'sequelize';
import { ModuleRef } from '@nestjs/core';
import { DocumentoMovimientoService } from './documentos-movimiento/documento-movimiento.service';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentoTransaccionService } from './documentos-transaccion/documento-transaccion.service';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';

@Injectable()
export class DocumentoFuenteService implements OnModuleInit {

    private documentoMovimientoService!: DocumentoMovimientoService;
    private documentoTransaccionService!: DocumentoTransaccionService;


    constructor(
        @InjectModel(DocumentoFuenteOrm) private documentoFuenteOrm: typeof DocumentoFuenteOrm,
        private moduleRef: ModuleRef,
        private conectorService: ConectorService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.documentoTransaccionService = this.moduleRef.get( DocumentoTransaccionService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoTransaccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, items: DocumentoFuente[] )
    {
        const transaction = s.transaction;
        const recordItems: Record<string, DocumentoFuente> = {}
        items.forEach( item => {
            if ( item.uuid ) recordItems[item.uuid] = item;
        } );

        const orms = await DocumentoFuenteOrm.bulkCreate(
            items.map( item => ({
                uuid: item.uuid,
                codigoSerie: item.codigoSerie,
                codigoNumero: item.codigoNumero,
                fechaEmision: item.fechaEmision,
                fechaAnulacion: item.fechaAnulacion,
                concepto: item.concepto,
                importeNeto: item.importeNeto,
                usuarioUuid: item.usuario?.uuid,
                fechaCreacion: item.fechaCreacion,
                fechaActualizacion: item.fechaActualizacion
            }) ),
            { transaction }
        );

        orms.forEach( orm => recordItems[orm.uuid].set({ ...orm.get() }).setRelation() )
    }


    async getRecordCodigos( options: { transaction: Transaction, series: string[] } )
    {
        const setSeries = [...new Set(options.series)]
        const recordCodigos: Record<string,number> = {}
        
        for ( const serie of setSeries ) {

            const data: Array<{ codigoNumero: number }> = await this.conectorService.executeQuery({
                transaction: options.transaction,
                query: `
                    select ifnull( max( cod_numero ) + 1, 1 ) as codigoNumero
                    from documento_fuente
                    where documento_fuente.cod_serie = :codigoSerie
                `,
                parameters: {
                    codigoSerie: serie
                }
            });
    
            recordCodigos[serie] = data[0].codigoNumero;
        }

        return recordCodigos;
    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.documentoMovimientoService.getCollection( s );
        const data2 = await this.documentoTransaccionService.getCollection( s );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectByUuid( s: SessionData, documentoFuente: DocumentoFuente )
    {
        try {
            return await this.documentoMovimientoService.getObjectByUuid( s, new DocumentoMovimiento({ ...documentoFuente }) );
        }
        catch ( error ) {
            return await this.documentoTransaccionService.getObjectByUuid( s, new DocumentoTransaccion({ ...documentoFuente }) );
        }
    }
}