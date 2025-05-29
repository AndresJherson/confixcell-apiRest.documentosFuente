import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { DocumentoMovimientoRepository } from '../documento-movimiento.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';
import { DocumentoEntradaBienConsumo, Prop } from '@confixcell/modelos';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { EntradaBienConsumoRepository } from 'src/infrastructure/repositories/movimientos-recurso/entrada/entrada-bien-consumo.service';

@Injectable()
export class DocumentoEntradaBienConsumoRepository implements OnModuleInit {

    private documentoMovimientoRepository!: DocumentoMovimientoRepository;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private entradaBienConsumoRepository: EntradaBienConsumoRepository
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoRepository = this.moduleRef.get( DocumentoMovimientoRepository, { strict: false } );

        if ( !this.documentoMovimientoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        await this.documentoMovimientoRepository.executeCreateCollection( s, documentosEntradaBienConsumo );
        await this.entradaBienConsumoRepository.executeCreateCollection( s, documentosEntradaBienConsumo.flatMap( doc => doc.entradas ) );
    }


    async executeDeleteCollection( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        return await this.documentoMovimientoRepository.executeDeleteCollection( s, documentosEntradaBienConsumo );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async setCode( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        return await this.documentoMovimientoRepository.setCode( s, documentosEntradaBienConsumo );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoEntradaBienConsumo,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, documentoEntradaBienConsumo: DocumentoEntradaBienConsumo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoEntradaBienConsumo,
            transaction: s.transaction,
            query: `
                ${this.query}
                and documento_movimiento.id ${documentoEntradaBienConsumo.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: documentoEntradaBienConsumo.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, documentoEntradaBienConsumo: DocumentoEntradaBienConsumo )
    {
        const dateTimeEmision = Prop.toDateTime( documentoEntradaBienConsumo.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        documentoEntradaBienConsumo.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            entradas: documentoEntradaBienConsumo.entradas.map( ent => ent.set({
                uuid: v4()
            }) )
        });

        await this.setCode( s, [ documentoEntradaBienConsumo ] );

        documentoEntradaBienConsumo.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' )
        });


        await this.executeCreateCollection( s, [ documentoEntradaBienConsumo ] );
        return await this.getObjectById( s, documentoEntradaBienConsumo );
    }



    async updateVoid( s: SessionData, documentoEntradaBienConsumo: DocumentoEntradaBienConsumo )
    {
        await this.documentoMovimientoRepository.updateVoid( s, documentoEntradaBienConsumo );
        return await this.getObjectById( s, documentoEntradaBienConsumo );
    }


    async delete( s: SessionData, documentoEntradaBienConsumo: DocumentoEntradaBienConsumo )
    {
        const doc2delete = await this.getObjectById( s, documentoEntradaBienConsumo );
        const af1 = await this.executeDeleteCollection( s, [ doc2delete ] );

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
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
where exists (
    select 1
    from entrada_bien_consumo
    where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
)
    `;
}