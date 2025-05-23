import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoMovimientoService } from '../documento-movimiento.service';
import { ConectorService } from 'src/services/conector.service';
import { ModuleRef } from '@nestjs/core';
import { SalidaBienConsumoService } from 'src/repositories/movimientos-recurso/salida/salida-bien-consumo.service';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { DocumentoSalidaBienConsumo, Prop } from '@confixcell/modelos';
import { v4 } from 'uuid';

@Injectable()
export class DocumentoSalidaBienConsumoService {

    private documentoMovimientoService!: DocumentoMovimientoService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private salidaBienConsumoService: SalidaBienConsumoService
    )
    {}


    onModuleInit() 
    {
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, documentosSalidaBienConsumo: DocumentoSalidaBienConsumo[] )
    {
        await this.documentoMovimientoService.executeCreateCollection( s, documentosSalidaBienConsumo );
        await this.salidaBienConsumoService.executeCreateCollection( s, documentosSalidaBienConsumo.flatMap( doc => doc.salidas ) );
    }


    async executeDeleteCollection( s: SessionData, documentosSalidaBienConsumo: DocumentoSalidaBienConsumo[] )
    {
        return await this.documentoMovimientoService.executeDeleteCollection( s, documentosSalidaBienConsumo );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async setCode( s: SessionData, documentosSalidaBienConsumo: DocumentoSalidaBienConsumo[] )
    {
        return await this.documentoMovimientoService.setCode( s, documentosSalidaBienConsumo );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: DocumentoSalidaBienConsumo,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, documentoSalidaBienConsumo: DocumentoSalidaBienConsumo )
    {
        const data = await this.conectorService.executeQuery({
            target: DocumentoSalidaBienConsumo,
            transaction: s.transaction,
            query: `
                ${this.query}
                and documento_movimiento.id ${documentoSalidaBienConsumo.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: documentoSalidaBienConsumo.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async createAndIssue( s: SessionData, documentoSalidaBienConsumo: DocumentoSalidaBienConsumo )
    {
        const dateTimeEmision = Prop.toDateTime( documentoSalidaBienConsumo.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        documentoSalidaBienConsumo.set({
            uuid: v4(),
            codigoSerie: `MOV${dateTimeEmision.toFormat( 'yyyy' )}`,
            salidas: documentoSalidaBienConsumo.salidas.map( sal => sal.set({
                uuid: v4()
            }) )
        });

        await this.setCode( s, [ documentoSalidaBienConsumo ] );

        documentoSalidaBienConsumo.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        });


        await this.executeCreateCollection( s, [ documentoSalidaBienConsumo ] );
        return await this.getObjectById( s, documentoSalidaBienConsumo );
    }



    async updateVoid( s: SessionData, documentoSalidaBienConsumo: DocumentoSalidaBienConsumo )
    {
        await this.documentoMovimientoService.updateVoid( s, documentoSalidaBienConsumo );
        return await this.getObjectById( s, documentoSalidaBienConsumo );
    }


    async delete( s: SessionData, documentoSalidaBienConsumo: DocumentoSalidaBienConsumo )
    {
        const doc2delete = await this.getObjectById( s, documentoSalidaBienConsumo );
        const af1 = await this.executeDeleteCollection( s, [ doc2delete ] );

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
select json_object(
    'type', 'DocumentoSalidaBienConsumo',
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
        select json_arrayagg(cte_salida_bien_consumo.json)
        from (

            select 
                salida_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaBienConsumoValorNuevo',
                    'id', salida_bien_consumo.id,
                    'uuid', salida_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                    'cantidadSaliente', salida_bien_consumo.cant,
                    'importePrecioUnitario', salida_bien_consumo.precio_uni
                ) as json
            from salida_bien_consumo_valor_nuevo
            left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_nuevo.id

            union all

            select 
                salida_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaBienConsumoValorEntrada',
                    'id', salida_bien_consumo.id,
                    'uuid', salida_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                    'cantidadSaliente', salida_bien_consumo.cant,
                    'importePrecioUnitario', salida_bien_consumo.precio_uni,
                    'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                ) as json
            from salida_bien_consumo_valor_entrada
            left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

        ) as cte_salida_bien_consumo
        where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from salida_bien_consumo
    where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
)
    `;
}