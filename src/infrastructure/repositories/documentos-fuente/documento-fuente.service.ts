import { DocumentoFuente, DocumentoMovimiento, DocumentoTransaccion } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { Op } from 'sequelize';
import { ModuleRef } from '@nestjs/core';
import { DocumentoMovimientoRepository } from './documentos-movimiento/documento-movimiento.service';
import { DocumentoTransaccionRepository } from './documentos-transaccion/documento-transaccion.service';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';

@Injectable()
export class DocumentoFuenteRepository implements OnModuleInit {

    private documentoMovimientoRepository!: DocumentoMovimientoRepository;
    private documentoTransaccionRepository!: DocumentoTransaccionRepository;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoRepository = this.moduleRef.get( DocumentoMovimientoRepository, { strict: false } );
        this.documentoTransaccionRepository = this.moduleRef.get( DocumentoTransaccionRepository, { strict: false } );

        if ( !this.documentoMovimientoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoTransaccionRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosFuente: DocumentoFuente[] )
    {
        await DocumentoFuenteOrm.bulkCreate(
            documentosFuente.map( doc => ({
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
            }
        );
    }


    async executeDeleteCollection( s: SessionData, documentosFuente: DocumentoFuente[] )
    {
        const af1 = await DocumentoFuenteOrm.destroy({
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
        const data1 = await this.documentoMovimientoRepository.getCollection( s );
        const data2 = await this.documentoTransaccionRepository.getCollection( s );

        return [ ...data1, ...data2 ].sort( ( a, b ) => ( a.id ?? 0 ) - ( b.id ?? 0) )
    }


    async getObjectById( s: SessionData, documentoFuente: DocumentoFuente )
    {
        try {
            return await this.documentoMovimientoRepository.getObjectById( s, new DocumentoMovimiento({ ...documentoFuente }) );
        }
        catch ( error ) {
            return await this.documentoTransaccionRepository.getObjectById( s, new DocumentoTransaccion({ ...documentoFuente }) );
        }
    }

    async updateVoid( s: SessionData, documentoFuente: DocumentoFuente )
    {
        const doc2validate = await this.getObjectById( s, documentoFuente );
        if ( doc2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const [af1] = await DocumentoFuenteOrm.update({
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