import { DbPreset, DocumentoFuente, DocumentoMovimiento, DocumentoTransaccion } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { NotaEntity } from 'src/entities/DocumentosFuente/Nota/NotaEntity';
import { Op } from 'sequelize';
import { ModuleRef } from '@nestjs/core';
import { DocumentoMovimientoService } from './documentos-movimiento/documento-movimiento.service';
import { DocumentoTransaccionService } from './documentos-transaccion/documento-transaccion.service';
import { DbPresetService } from '../preset/db-preset.service';

@Injectable()
export class DocumentoFuenteService implements OnModuleInit {

    private documentoMovimientoService!: DocumentoMovimientoService;
    private documentoTransaccionService!: DocumentoTransaccionService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private dbPresetService: DbPresetService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.documentoTransaccionService = this.moduleRef.get( DocumentoTransaccionService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoTransaccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosFuente: DocumentoFuente[] )
    {
        const establecimientoPreset = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'documento_fuente.establecimiento_uuid' }) );
        if ( !establecimientoPreset.valor ) throw new InternalServerErrorException( `${establecimientoPreset.titulo} NO ESTABLECIDO` );

        await DocumentoFuenteEntity.bulkCreate( documentosFuente.map( doc => ({
            id: doc.id,
            uuid: doc.uuid,
            codigoSerie: doc.codigoSerie,
            codigoNumero: doc.codigoNumero,
            fechaEmision: doc.fechaEmision,
            fechaAnulacion: doc.fechaAnulacion,
            concepto: doc.concepto,
            importeNeto: doc.importeNeto,
            usuarioUuid: s.usuarioSession.uuid,
            fechaCreacion: doc.fechaCreacion,
            fechaActualizacion: doc.fechaActualizacion
        }) ), {
            transaction: s.transaction,
        } );
    }


    async executeDeleteCollection( s: SessionData, documentosFuente: DocumentoFuente[] )
    {
        const af1 = await DocumentoFuenteEntity.destroy({
            where: {
                id: {
                    [Op.in]: documentosFuente.map( doc => doc.id ).filter( id => id !== undefined )
                }
            },
            transaction: s.transaction,
        });

        
        if ( af1 === 0 ) return 0
        else return 1;
    }


    async setCode( s: SessionData, documentosFuente: DocumentoFuente[] )
    {
        const recordSeries = documentosFuente.reduce(
            ( record, doc ) => {

                if ( doc.codigoSerie === undefined ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_ISSUE_WITHOUT_SERIE )

                if (!(doc.codigoSerie in record)) record[doc.codigoSerie] = []; 

                record[ doc.codigoSerie ].push( doc );

                return record;
            },
            {} as Record<string, DocumentoFuente[]>
        );
        

        for ( const [ serie, docs ] of Object.entries( recordSeries ) ) {

            const data: Array<{ codigoNumero: number }> = await this.conectorService.executeQuery({
                transaction: s.transaction,
                query: `
                    select ifnull( max( cod_numero ) + 1, 1 ) as codigoNumero
                    from documento_fuente
                    where documento_fuente.cod_serie = :codigoSerie
                `,
                parameters: {
                    codigoSerie: serie
                }
            });
    
            let numero = data[0].codigoNumero;

            docs.forEach( doc => {
                doc.set({ codigoNumero: numero })
                numero++;
            } )

        }

    }


    async getCollection( s: SessionData )
    {
        const data1 = await this.documentoMovimientoService.getCollection( s );
        const data2 = await this.documentoTransaccionService.getCollection( s );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoFuente: DocumentoFuente )
    {
        try {
            return await this.documentoMovimientoService.getObjectById( s, new DocumentoMovimiento({ ...documentoFuente }) );
        }
        catch ( error ) {
            return await this.documentoTransaccionService.getObjectById( s, new DocumentoTransaccion({ ...documentoFuente }) );
        }
    }

    async updateVoid( s: SessionData, documentoFuente: DocumentoFuente )
    {
        const doc2validate = await this.getObjectById( s, documentoFuente );
        if ( doc2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const [af1] = await DocumentoFuenteEntity.update({
            fechaAnulacion: documentoFuente.fechaAnulacion
        }, {
            where: {
                id: documentoFuente.id
            },
            transaction: s.transaction
        });
    

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );
    }
}