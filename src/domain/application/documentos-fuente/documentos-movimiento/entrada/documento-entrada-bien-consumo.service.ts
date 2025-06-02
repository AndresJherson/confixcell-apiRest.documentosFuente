import { Inject, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';
import { DocumentoEntradaBienConsumo, Prop } from '@confixcell/modelos';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { EntradaBienConsumoService } from 'src/domain/application/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { DocumentoFuenteService } from '../../documento-fuente.service';
import { MovimientoRecursoService } from 'src/domain/application/movimientos-recurso/movimiento-recurso.service';
import { ClientNats } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DocumentoEntradaBienConsumoService implements OnModuleInit {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoMovimientoService!: DocumentoMovimientoService;
    private entradaBienConsumoService!: EntradaBienConsumoService
    private movimientoRecursoService!: MovimientoRecursoService;

    constructor(
        private conectorService: ConectorService,
        @Inject('NATS') private clientNats: ClientNats,
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.entradaBienConsumoService = this.moduleRef.get( EntradaBienConsumoService, { strict: false } );
        this.movimientoRecursoService = this.moduleRef.get( MovimientoRecursoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.entradaBienConsumoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.movimientoRecursoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, items: DocumentoEntradaBienConsumo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, items );
        await this.entradaBienConsumoService.executeCreateCollection( s, items.flatMap( doc => doc.entradas ) );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoEntradaBienConsumo,
            transaction: s.transaction,
            query: `
                ${this.query}
                where exists (
                    select 1
                    from entrada_bien_consumo
                    where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
                )
            `
        }).then( data => data.map( item => item.setRelation().procesarInformacion() ) );
    }


    async getObjectByUuid( s: SessionData, item: DocumentoEntradaBienConsumo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoEntradaBienConsumo,
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

        return data[0].setRelation()
            .procesarInformacion();
    }


    async createAndIssue( s: SessionData, item: DocumentoEntradaBienConsumo )
    {
        const dateTimeEmision = Prop.toDateTime( item.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        item.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            usuario: s.usuarioSession,
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
        const item2send = await this.getObjectByUuid( s, item );
        s.postCommitEvents.push( () => firstValueFrom(this.clientNats.emit('kardexBienConsumo.crearMovimiento', item2send.toRecordKardexBienConsumo())) );
        return item2send;
    }


    async updateVoid( s: SessionData, item: DocumentoEntradaBienConsumo )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const uuidsMovimientos = item.entradas.map( ent => ent.uuid ).filter( uuid => uuid !== undefined );
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

        s.postCommitEvents.push( () => firstValueFrom(this.clientNats.emit('kardexBienConsumo.eliminarMovimiento', item2validate.toRecordKardexBienConsumo())) )
        return await this.getObjectByUuid( s, item2validate );
    }


    async delete( s: SessionData, item: DocumentoEntradaBienConsumo )
    {
        const af1 = await DocumentoFuenteOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException(ERROR.NON_DELETE);
    }


    query = `
select json_object(
    'type', 'DocumentoEntradaBienConsumo',
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
        select json_arrayagg(cte_entrada_bien_consumo.json)
        from (

            select 
                entrada_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'EntradaBienConsumoValorNuevo',
                    'id', entrada_bien_consumo.id,
                    'uuid', entrada_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                    'cantidadEntrante', entrada_bien_consumo.cant,
                    'cantidadSaliente', (
                        select sum(salida_bien_consumo.cant)
                        from salida_bien_consumo_valor_entrada
                        left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                        where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
                    ),
                    'importeValorUnitario', entrada_bien_consumo_valor_nuevo.valor_uni
                ) as json
            from entrada_bien_consumo_valor_nuevo
            left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_nuevo.id

            union all

            select 
                entrada_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'typee', 'EntradaBienConsumoValorSalida',
                    'id', entrada_bien_consumo.id,
                    'uuid', entrada_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                    'cantidadEntrante', entrada_bien_consumo.cant,
                    'cantidadSaliente', (
                        select sum(salida_bien_consumo.cant)
                        from salida_bien_consumo_valor_entrada
                        left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                        where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
                    ),
                    'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                ) as json
            from entrada_bien_consumo_valor_salida
            left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

        ) as cte_entrada_bien_consumo
        where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
    `;
}