import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoSalidaEfectivo, Prop } from '@confixcell/modelos';
import { v4 } from 'uuid';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { DocumentoFuenteService } from '../../documento-fuente.service';
import { SalidaEfectivoService } from 'src/domain/application/movimientos-recurso/salida/salida-efectivo.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { MovimientoRecursoService } from 'src/domain/application/movimientos-recurso/movimiento-recurso.service';

@Injectable()
export class DocumentoSalidaEfectivoService {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoMovimientoService!: DocumentoMovimientoService;
    private salidaEfectivoService!: SalidaEfectivoService;
    private movimientoRecursoService!: MovimientoRecursoService;

    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.salidaEfectivoService = this.moduleRef.get( SalidaEfectivoService, { strict: false } );
        this.movimientoRecursoService = this.moduleRef.get( MovimientoRecursoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.salidaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.movimientoRecursoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosSalidaEfectivo: DocumentoSalidaEfectivo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, documentosSalidaEfectivo );
        await this.salidaEfectivoService.executeCreateCollection( s, documentosSalidaEfectivo.flatMap( doc => doc.salidas ) );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoSalidaEfectivo,
            transaction: s.transaction,
            query: `
                ${this.query}
                where exists (
                    select 1
                    from salida_efectivo
                    where salida_efectivo.documento_fuente_id = documento_movimiento.id
                )
            `
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectByUuid( s: SessionData, item: DocumentoSalidaEfectivo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoSalidaEfectivo,
            transaction: s.transaction,
            query: `
                ${this.query}
                where documento_fuente.uuid ${item.uuid === undefined ? ' is null ': ' = :uuid '}
            `,
            parameters: {
                uuid: item.uuid ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );
        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, item: DocumentoSalidaEfectivo )
    {
        const dateTimeEmision = Prop.toDateTime( item.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        item.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            usuario: s.usuarioSession,
            salidas: item.salidas.map( sal => sal.set({
                uuid: v4()
            }) )
        });

        const codigos = await this.documentoFuenteService.getRecordCodigos({
            transaction: s.transaction,
            series: [ item.codigoSerie! ]
        });

        item.set({
            codigoNumero: codigos[item.codigoSerie!]
        })
        .setRelation()
        .procesarInformacion()


        await this.executeCreateCollection( s, [ item ] );
        return await this.getObjectByUuid( s, item );
    }



    async updateVoid( s: SessionData, item: DocumentoSalidaEfectivo )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const uuidsMovimientos = item.salidas.map( sal => sal.uuid ).filter( uuid => uuid !== undefined );
        await this.movimientoRecursoService.verifyUuidReferences( s, uuidsMovimientos )

        const [af1] = await DocumentoFuenteOrm.update({
            fechaAnulacion: item.fechaAnulacion ?? null as any,
            fechaActualizacion: item.fechaActualizacion ?? null as any,
            usuarioUuid: s.usuarioSession.uuid ?? null as any
        }, {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException(ERROR.NON_UPDATE);
        return await this.getObjectByUuid( s, item2validate );
    }


    async delete( s: SessionData, item: DocumentoSalidaEfectivo )
    {
        const af1 = await DocumentoFuenteOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

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
    `;
}