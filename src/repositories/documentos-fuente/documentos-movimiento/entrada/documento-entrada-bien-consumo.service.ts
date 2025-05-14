import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { EntradaBienConsumoService } from 'src/repositories/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SessionData } from 'src/utils/interfaces';
import { ConectorService } from 'src/services/conector.service';
import { v4 } from 'uuid';
import { DocumentoEntradaBienConsumo, Prop } from '@confixcell/modelos';

@Injectable()
export class DocumentoEntradaBienConsumoService implements OnModuleInit {

    private documentoMovimientoService!: DocumentoMovimientoService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private entradaBienConsumoService: EntradaBienConsumoService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, documentosEntradaBienConsumo );
        await this.entradaBienConsumoService.executeCreateCollection( s, documentosEntradaBienConsumo.flatMap( doc => doc.entradas ) );
    }


    async executeDeleteCollection( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        return await this.documentoMovimientoService.executeDeleteCollection( s, documentosEntradaBienConsumo );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async setCode( s: SessionData, documentosEntradaBienConsumo: DocumentoEntradaBienConsumo[] )
    {
        return await this.documentoMovimientoService.setCode( s, documentosEntradaBienConsumo );
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
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`
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
        await this.documentoMovimientoService.updateVoid( s, documentoEntradaBienConsumo );
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
                select json_arrayagg(cte_entrada_bien_consumo.json)
                from (

                    select 
                        entrada_bien_consumo.documento_fuente_id as documento_fuente_id,
                        json_object(
                            'type', 'EntradaBienConsumoValorNuevo',
                            'id', entrada_bien_consumo.id,
                            'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                            'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                            'cantidad', entrada_bien_consumo.cant,
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
                            'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                            'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                            'cantidad', entrada_bien_consumo.cant,
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