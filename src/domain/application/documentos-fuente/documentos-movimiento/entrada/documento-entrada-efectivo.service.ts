import { DocumentoEntradaEfectivo, Prop } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { DocumentoFuenteService } from '../../documento-fuente.service';
import { EntradaEfectivoService } from 'src/domain/application/movimientos-recurso/entrada/entrada-efectivo.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { MovimientoRecursoService } from 'src/domain/application/movimientos-recurso/movimiento-recurso.service';

@Injectable()
export class DocumentoEntradaEfectivoService implements OnModuleInit {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoMovimientoService!: DocumentoMovimientoService;
    private entradaEfectivoService!: EntradaEfectivoService
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
        this.entradaEfectivoService = this.moduleRef.get( EntradaEfectivoService, { strict: false } );
        this.movimientoRecursoService = this.moduleRef.get( MovimientoRecursoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.entradaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.movimientoRecursoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, items: DocumentoEntradaEfectivo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, items );
        await this.entradaEfectivoService.executeCreateCollection( s, items.flatMap( doc => doc.entradas ) );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoEntradaEfectivo,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectByUuid( s: SessionData, item: DocumentoEntradaEfectivo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoEntradaEfectivo,
            transaction: s.transaction,
            query: `
                ${this.query}
                and documento_fuente.uuid ${item.uuid === undefined ? ' is null ': ' = :uuid '}
            `,
            parameters: {
                uuid: item.uuid ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, item: DocumentoEntradaEfectivo )
    {
        const dateTimeEmision = Prop.toDateTime( item.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        item.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            entradas: item.entradas.map( ent => ent.set({
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


    async updateVoid( s: SessionData, item: DocumentoEntradaEfectivo )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const uuidsMovimientos = item.entradas.map( ent => ent.uuid ).filter( uuid => uuid !== undefined );
        await this.movimientoRecursoService.verifyUuidReferences( s, uuidsMovimientos )

        const [af1] = await DocumentoFuenteOrm.update({
            fechaAnulacion: item.fechaAnulacion,
            fechaActualizacion: item.fechaActualizacion
        }, {
            where: {
                uuid: item.uuid
            },
            transaction: s.transaction
        });


        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );
        return await this.getObjectByUuid( s, item2validate )
    }

    async delete( s: SessionData, item: DocumentoEntradaEfectivo )
    {
        const af1 = await DocumentoFuenteOrm.destroy({
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
select json_object(
    'type', 'DocumentoEntradaEfectivo',
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

    'entradas', ( 
        select json_arrayagg(cte_entrada_efectivo.json)
        from (

            select 
                entrada_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'EntradaEfectivoContado',
                    'id', entrada_efectivo.id,
                    'uuid', entrada_efectivo.uuid,
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
                    'uuid', entrada_efectivo.uuid,
                    'importeValorNeto', entrada_efectivo.valor,
                    'tasaInteresDiario', entrada_efectivo_credito.tasa_interes_diario,
                    'cuotas', (
                        select json_arrayagg(json_object(
                            'id', entrada_efectivo_cuota.id,
                            'numero', entrada_efectivo_cuota.numero,
                            'fechaInicio', concat(entrada_efectivo_cuota.f_inicio,'Z'),
                            'fechaVencimiento', concat(entrada_efectivo_cuota.f_vencimiento,'Z'),
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