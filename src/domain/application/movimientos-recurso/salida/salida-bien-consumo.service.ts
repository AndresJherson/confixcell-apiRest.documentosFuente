import { BienConsumo, NotaVentaSalidaBienConsumo, SalidaBienConsumo, SalidaBienConsumoValorEntrada, SalidaBienConsumoValorNuevo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NvSalidaBienConsumoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoOrm';
import { SalidaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';
import { SalidaBienConsumoValorEntradaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaOrm';
import { SalidaBienConsumoValorNuevoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaBienConsumoService {

    constructor(
        private conectorService: ConectorService
    )
    {}


    async executeCreateCollection(s: SessionData, items: SalidaBienConsumo[])
    {
        const transaction = s.transaction;
        const recordItems: Record<string, SalidaBienConsumo> = {};
        items.forEach( item => {
            if ( item.uuid ) recordItems[item.uuid] = item;
        } );
        
        const orms = await SalidaBienConsumoOrm.bulkCreate(
            items.map(sal => ({
                uuid: sal.uuid,
                documentoFuenteId: sal.documentoFuente?.id,
                almacenUuid: sal.almacen?.uuid,
                bienConsumoUuid: sal.bienConsumo?.uuid,
                cantidadSaliente: sal.cantidadSaliente,
                importePrecioUnitario: sal.importePrecioUnitario
            })),
            { transaction }
        );

        orms.forEach( orm => recordItems[orm.uuid].set({...orm.get()}).setRelation() );
        

        for (const sal of items) {
            if (sal instanceof SalidaBienConsumoValorNuevo) {
                await SalidaBienConsumoValorNuevoOrm.create({
                    id: sal.id
                }, { transaction });
            }
            else if (sal instanceof SalidaBienConsumoValorEntrada) {
                await SalidaBienConsumoValorEntradaOrm.create({
                    id: sal.id,
                    entradaBienConsumoId: sal.entrada?.id
                }, { transaction });
            }
            else if (sal instanceof NotaVentaSalidaBienConsumo) {
                await NvSalidaBienConsumoOrm.create({
                    id: sal.id,
                    notaVentaId: sal.documentoFuente?.id,
                    importeDescuento: sal.importeDescuento
                }, { transaction });
            }
            else {
                throw new InternalServerErrorException('Tipo de salida de bien de consumo invalido');
            }
        }
    }


    async getCollectionByBienConsumoUuid( s: SessionData, bienConsumo: BienConsumo )
    {
        return await this.conectorService.executeQuery({
            target: SalidaBienConsumo.initialize,
            transaction: s.transaction,
            query: `
                ${this.query}
                where cte_salida_bien_consumo.bien_consumo_uuid ${bienConsumo.uuid !== undefined ? ' = :bienConsumoUuid ' : ' is null '}
            `,
            parameters: {
                bienConsumoUuid: bienConsumo.uuid ?? null
            }
        });
    }


    query = `
select cte_salida_bien_consumo.json
from (
    select 
        salida_bien_consumo.id as id,
        salida_bien_consumo.uuid as uuid,
        salida_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'SalidaBienConsumoValorNuevo',
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object('uuid', salida_bien_consumo.uuid),
            'bienConsumo', json_object('uuid', salida_bien_consumo.bien_consumo_uuid),
            'cantidadSaliente', salida_bien_consumo.cant,
            'cantidadEntrante', (
                select sum(entrada_bien_consumo.cant)
                from entrada_bien_consumo_valor_salida
                left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
            ),
            'importePrecioUnitario', salida_bien_consumo.precio_uni
        ) as json
    from salida_bien_consumo_valor_nuevo
    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_nuevo.id
    left join documento_fuente on documento_fuente.id = salida_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null

    union all

    select 
        salida_bien_consumo.id as id,
        salida_bien_consumo.uuid as uuid,
        salida_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'SalidaBienConsumoValorEntrada',
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object('uuid', salida_bien_consumo.uuid),
            'bienConsumo', json_object('uuid', salida_bien_consumo.bien_consumo_uuid),
            'cantidadSaliente', salida_bien_consumo.cant,
            'cantidadEntrante', (
                select sum(entrada_bien_consumo.cant)
                from entrada_bien_consumo_valor_salida
                left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
            ),
            'importePrecioUnitario', salida_bien_consumo.precio_uni
        ) as json
    from salida_bien_consumo_valor_entrada
    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
    left join documento_fuente on documento_fuente.id = salida_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null

    union all

    select
        salida_bien_consumo.id as id,
        salida_bien_consumo.uuid as uuid,
        salida_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
            'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
            'cantidadSaliente', salida_bien_consumo.cant,
            'cantidadEntrante', (
                select sum(entrada_bien_consumo.cant)
                from entrada_bien_consumo_valor_salida
                left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
            ),
            'importePrecioUnitario', salida_bien_consumo.precio_uni,
            'importeDescuento', nv_salida_bien_consumo.descuento
        )
    from nv_salida_bien_consumo
    left join salida_bien_consumo on salida_bien_consumo.id = nv_salida_bien_consumo.id
    left join documento_fuente on documento_fuente.id = salida_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null
) as cte_salida_bien_consumo
    `;
}
