import { BienConsumo, EntradaBienConsumo, EntradaBienConsumoValorNuevo, EntradaBienConsumoValorSalida } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntradaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoOrm';
import { EntradaBienConsumoValorNuevoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorNuevoOrm';
import { EntradaBienConsumoValorSalidaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class EntradaBienConsumoService {

    constructor(
        private conectorService: ConectorService
    )
    {}

    async executeCreateCollection(s: SessionData, items: EntradaBienConsumo[])
    {
        const transaction = s.transaction;
        const recordItems: Record<string, EntradaBienConsumo> = {};
        items.forEach( item => {
            if ( item.uuid ) recordItems[item.uuid] = item;
        } );

        const orms = await EntradaBienConsumoOrm.bulkCreate(
            items.map(item => ({
                uuid: item.uuid,
                documentoFuenteId: item.documentoFuente?.id,
                almacenUuid: item.almacen?.uuid,
                bienConsumoUuid: item.bienConsumo?.uuid,
                cantidadEntrante: item.cantidadEntrante
            })),
            { transaction }
        );

        orms.forEach( orm => recordItems[orm.uuid].set({...orm.get()}).setRelation() )
        

        for (const item of items) {
            if (item instanceof EntradaBienConsumoValorNuevo) {
                await EntradaBienConsumoValorNuevoOrm.create({
                    id: item.id,
                    importeValorUnitario: item.importeValorUnitario
                }, { transaction });
            }
            else if (item instanceof EntradaBienConsumoValorSalida) {
                await EntradaBienConsumoValorSalidaOrm.create({
                    id: item.id,
                    salidaBienConsumoId: item.salida?.id
                }, { transaction });
            }
            else {
                throw new InternalServerErrorException('Tipo de entrada de bien de consumo invalido');
            }
        }    
    }


    async getCollectionByBienConsumoUuid( s: SessionData, bienConsumo: BienConsumo )
    {
        return await this.conectorService.executeQuery({
            target: EntradaBienConsumo.initialize,
            transaction: s.transaction,
            query: `
                ${this.query}
                where cte_entrada_bien_consumo.bien_consumo_uuid ${bienConsumo.uuid !== undefined ? ' = :bienConsumoUuid ' : ' is null '}
            `,
            parameters: {
                bienConsumoUuid: bienConsumo.uuid ?? null
            }
        });
    }


    query = `
select cte_entrada_bien_consumo.json
from (
    select 
        entrada_bien_consumo.id as id,
        entrada_bien_consumo.uuid as uuid,
        entrada_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'EntradaBienConsumoValorNuevo',
            'id', entrada_bien_consumo.id,
            'uuid', entrada_bien_consumo.uuid,
            'almacen', json_object('uuid', entrada_bien_consumo.almacen_uuid),
            'bienConsumo', json_object('uuid', entrada_bien_consumo.bien_consumo_uuid),
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
    left join documento_fuente on documento_fuente.id = entrada_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null

    union all

    select 
        entrada_bien_consumo.id as id,
        entrada_bien_consumo.uuid as uuid,
        entrada_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'EntradaBienConsumoValorSalida',
            'id', entrada_bien_consumo.id,
            'uuid', entrada_bien_consumo.uuid,
            'almacen', json_object('uuid', entrada_bien_consumo.almacen_uuid),
            'bienConsumo', json_object('uuid', entrada_bien_consumo.bien_consumo_uuid),
            'cantidadEntrante', entrada_bien_consumo.cant,
            'cantidadSaliente', (
                select sum(salida_bien_consumo.cant)
                from salida_bien_consumo_valor_entrada
                left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
            )
        ) as json
    from entrada_bien_consumo_valor_salida
    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
    left join documento_fuente on documento_fuente.id = entrada_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null
) as cte_entrada_bien_consumo
    `;
}