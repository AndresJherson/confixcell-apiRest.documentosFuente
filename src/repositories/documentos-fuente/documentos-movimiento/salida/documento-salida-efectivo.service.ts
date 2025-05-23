import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ConectorService } from 'src/services/conector.service';
import { ModuleRef } from '@nestjs/core';
import { SalidaEfectivoService } from 'src/repositories/movimientos-recurso/salida/salida-efectivo.service';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoSalidaEfectivo, Prop } from '@confixcell/modelos';
import { v4 } from 'uuid';

@Injectable()
export class DocumentoSalidaEfectivoService {

    private documentoMovimientoService!: DocumentoMovimientoService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private salidaEfectivoService: SalidaEfectivoService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosSalidaEfectivo: DocumentoSalidaEfectivo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, documentosSalidaEfectivo );
        await this.salidaEfectivoService.executeCreateCollection( s, documentosSalidaEfectivo.flatMap( doc => doc.salidas ) );
    }


    async executeDeleteCollection( s: SessionData, documentosSalidaEfectivo: DocumentoSalidaEfectivo[] )
    {
        return await this.documentoMovimientoService.executeDeleteCollection( s, documentosSalidaEfectivo );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async setCode( s: SessionData, documentosSalidaEfectivo: DocumentoSalidaEfectivo[] )
    {
        return await this.documentoMovimientoService.setCode( s, documentosSalidaEfectivo );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoSalidaEfectivo,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, documentoSalidaEfectivo: DocumentoSalidaEfectivo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoSalidaEfectivo,
            transaction: s.transaction,
            query: `
                ${this.query}
                and documento_movimiento.id ${documentoSalidaEfectivo.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: documentoSalidaEfectivo.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, documentoSalidaEfectivo: DocumentoSalidaEfectivo )
    {
        const dateTimeEmision = Prop.toDateTime( documentoSalidaEfectivo.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        documentoSalidaEfectivo.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            salidas: documentoSalidaEfectivo.salidas.map( sal => sal.set({
                uuid: v4()
            }) )
        });

        await this.setCode( s, [ documentoSalidaEfectivo ] );

        documentoSalidaEfectivo.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' )
        });


        await this.executeCreateCollection( s, [ documentoSalidaEfectivo ] );
        return await this.getObjectById( s, documentoSalidaEfectivo );
    }



    async updateVoid( s: SessionData, documentoSalidaEfectivo: DocumentoSalidaEfectivo )
    {
        await this.documentoMovimientoService.updateVoid( s, documentoSalidaEfectivo );
        return await this.getObjectById( s, documentoSalidaEfectivo );
    }


    async delete( s: SessionData, documentoSalidaEfectivo: DocumentoSalidaEfectivo )
    {
        const doc2delete = await this.getObjectById( s, documentoSalidaEfectivo );
        const af1 = await this.executeDeleteCollection( s, [ doc2delete ] );

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
select json_object(
    'type', 'DocumentoSalidaEfectivo',
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
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

    'salidas', (
        select json_arrayagg(cte_salida_efectivo.json)
        from (

            select 
                salida_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaEfectivoContado',
                    'id', salida_efectivo.id,
                    'uuid', salida_efectivo.uuid,
                    'medioTransferencia', (
                        select json_object(
                            'id', medio_transferencia.id,
                            'nombre', medio_transferencia.nombre
                        ) as json
                        from medio_transferencia
                        where medio_transferencia.id = salida_efectivo_contado.medio_transferencia_id
                    ),
                    'importeValorNeto', salida_efectivo.valor
                ) as json
            from salida_efectivo_contado
            left join salida_efectivo on salida_efectivo.id = salida_efectivo_contado.id

            union all

            select 
                salida_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaEfectivoCredito',
                    'id', salida_efectivo.id,
                    'uuid', salida_efectivo.uuid,
                    'importeValorNeto', salida_efectivo.valor,
                    'tasaInteresDiario', salida_efectivo_credito.tasa_interes_diario,
                    'cuotas', (
                        select json_arrayagg(json_object(
                            'id', salida_efectivo_cuota.id,
                            'numero', salida_efectivo_cuota.numero,
                            'fechaInicio', concat(salida_efectivo_cuota.f_inicio,'Z'),
                            'fechaVencimiento', concat(salida_efectivo_cuota.f_vencimiento,'Z'),
                            'impoteCuota', salida_efectivo_cuota.cuota,
                            'importeAmortizacion', salida_efectivo_cuota.amortizacion,
                            'importeInteres', salida_efectivo_cuota.interes,
                            'impoteSaldo', salida_efectivo_cuota.saldo
                        ))
                        from salida_efectivo_cuota
                        where salida_efectivo_cuota.salida_efectivo_credito_id = salida_efectivo_credito.id
                    )
                ) as json
            from salida_efectivo_credito
            left join salida_efectivo on salida_efectivo.id = salida_efectivo_credito.id

        ) as cte_salida_efectivo
        where cte_salida_efectivo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from salida_efectivo
    where salida_efectivo.documento_fuente_id = documento_movimiento.id
)
    `;
}