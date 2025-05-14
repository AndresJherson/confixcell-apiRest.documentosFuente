import { DocumentoEntradaEfectivo, Prop } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConectorService } from 'src/services/conector.service';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { EntradaEfectivoService } from 'src/repositories/movimientos-recurso/entrada/entrada-efectivo.service';

@Injectable()
export class DocumentoEntradaEfectivoService implements OnModuleInit {

    private documentoMovimientoService!: DocumentoMovimientoService;

    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private entradaEfectivoService: EntradaEfectivoService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosEntradaEfectivo: DocumentoEntradaEfectivo[] )
    {
       await this.documentoMovimientoService.executeCreateCollection( s, documentosEntradaEfectivo );
       await this.entradaEfectivoService.executeCreateCollection( s, documentosEntradaEfectivo.flatMap( doc => doc.entradas ) );
    }


    async executeDeleteCollection( s: SessionData, documentosEntradaEfectivo: DocumentoEntradaEfectivo[] )
    {
       return await this.documentoMovimientoService.executeDeleteCollection( s, documentosEntradaEfectivo ) ?? 0;
    }


    async getId( s: SessionData )
    {
        return this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async setCode( s: SessionData, documentosEntradaEfectivo: DocumentoEntradaEfectivo[] )
    {
        return await this.documentoMovimientoService.setCode( s, documentosEntradaEfectivo );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoEntradaEfectivo,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, documentoEntradaEfectivo: DocumentoEntradaEfectivo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoEntradaEfectivo,
            transaction: s.transaction,
            query: `
                ${this.query}
                and documento_movimiento.id ${documentoEntradaEfectivo.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: documentoEntradaEfectivo.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, documentoEntradaEfectivo: DocumentoEntradaEfectivo )
    {
        const dateTimeEmision = Prop.toDateTime( documentoEntradaEfectivo.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        documentoEntradaEfectivo.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`
        });

        await this.setCode( s, [ documentoEntradaEfectivo ] );

        documentoEntradaEfectivo.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' )
        });

        
        await this.executeCreateCollection( s, [ documentoEntradaEfectivo ] );
        return await this.getObjectById( s, documentoEntradaEfectivo );
    }


    async updateVoid( s: SessionData, documentoEntradaEfectivo: DocumentoEntradaEfectivo )
    {
        await this.documentoMovimientoService.updateVoid( s, documentoEntradaEfectivo );
        return await this.getObjectById( s, documentoEntradaEfectivo )
    }


    async delete( s: SessionData, documentoEntradaEfectivo: DocumentoEntradaEfectivo )
    {
        const doc2delete = await this.getObjectById( s, documentoEntradaEfectivo );
        const af1 = await this.executeDeleteCollection( s, [ doc2delete ] );

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
        select json_object(
            'type', 'DocumentoEntradaEfectivo',
            'id', documento_fuente.id,
            'uuid', documento_fuente.uuid,
            'codigoSerie', documento_fuente.cod_serie,
            'codigoNumero', documento_fuente.cod_numero,
            'fechaEmision', documento_fuente.f_emision,
            'fechaAnulacion', documento_fuente.f_anulacion,
            'importeNeto', documento_fuente.importe_neto,
            'establecimiento', json_object( 'uuid', documento_fuente.establecimiento_uuid ),
            'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
            'concepto', documento_movimiento.concepto,
            'documentoTransaccion', (
                select json_object(
                    'id', df.id,
                    'uuid', df.uuid,
                    'codigoSerie', df.cod_serie,
                    'codigoNumero', df.cod_numero,
                    'fechaCreacion', documento_transaccion.f_creacion,
                    'fechaActualizacion', documento_transaccion.f_actualizacion,
                    'fechaEmision', df.f_emision,
                    'fechaAnulacion', df.f_anulacion,
                    'importeNeto', df.importe_neto,
                    'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
                    'usuario', json_object( 'uuid', df.usuario_uuid ),
                    'concepto', documento_transaccion.concepto
                )
                from documento_transaccion
                left join documento_fuente df on df.id = documento_transaccion.id
                where documento_transaccion.id = documento_movimiento.documento_transaccion_id
            ),

            'notas', (
                select json_arrayagg(json_object(
                    'id', nota.id,
                    'fecha', nota.fecha,
                    'descripcion', nota.descripcion,
                    'usuario', json_object( 'uuid', nota.usuario_uuid )
                )) as json
                from nota
                where nota.documento_fuente_id = documento_fuente.id
            ),

            'entradas', ( 
                select json_arrayagg(cte_entrada_efectivo.json)
                from (

                    select 
                        entrada_efectivo.documento_fuente_id as documento_fuente_id,
                        json_object(
                            'type', 'EntradaEfectivoContado',
                            'id', entrada_efectivo.id,
                            'medioTransferencia', (
                                select json_object(
                                    'id', medio_transferencia.id,
                                    'nombre', medio_transferencia.nombre
                                ) as json
                                from medio_transferencia
                                where medio_transferencia.id = entrada_efectivo_contado.medio_transferencia_id
                            ),
                            'importeValorNeto', entrada_efectivo.valor
                        ) as json
                    from entrada_efectivo_contado
                    left join entrada_efectivo on entrada_efectivo.id = entrada_efectivo_contado.id

                    union all

                    select 
                        entrada_efectivo.documento_fuente_id as documento_fuente_id,
                        json_object(
                            'type', 'EntradaEfectivoCredito',
                            'id', entrada_efectivo.id,
                            'importeValorNeto', entrada_efectivo.valor,
                            'tasaInteresDiario', entrada_efectivo_credito.tasa_interes_diario,
                            'cuotas', (
                                select json_arrayagg(json_object(
                                    'id', entrada_efectivo_cuota.id,
                                    'numero', entrada_efectivo_cuota.numero,
                                    'fechaInicio', entrada_efectivo_cuota.f_inicio,
                                    'fechaVencimiento', entrada_efectivo_cuota.f_vencimiento,
                                    'importeCuota', entrada_efectivo_cuota.cuota,
                                    'importeAmortizacion', entrada_efectivo_cuota.amortizacion,
                                    'importeInteres', entrada_efectivo_cuota.interes,
                                    'importeSaldo', entrada_efectivo_cuota.saldo
                                ))
                                from entrada_efectivo_cuota
                                where entrada_efectivo_cuota.entrada_efectivo_credito_id = entrada_efectivo_credito.id
                            )
                        ) as json
                    from entrada_efectivo_credito
                    left join entrada_efectivo on entrada_efectivo.id = entrada_efectivo_credito.id

                ) as cte_entrada_efectivo
                where cte_entrada_efectivo.documento_fuente_id = documento_movimiento.id
            )
        ) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_efectivo
            where entrada_efectivo.documento_fuente_id = documento_movimiento.id
        )
    `;
}