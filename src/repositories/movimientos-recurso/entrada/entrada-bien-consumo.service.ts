import { Almacen, BienConsumo, EntradaBienConsumo, EntradaBienConsumoValorNuevo, EntradaBienConsumoValorSalida } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { EntradaBienConsumoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoEntity';
import { EntradaBienConsumoValorNuevoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorNuevoEntity';
import { EntradaBienConsumoValorSalidaEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaEntity';
import { ConectorService } from 'src/services/conector.service';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class EntradaBienConsumoService {

    constructor(
        private conectorService: ConectorService
    )
    {}

    async executeCreateCollection(s: SessionData, entradasBienConsumo: EntradaBienConsumo[])
    {
        const transaction = s.transaction;
        
        await EntradaBienConsumoEntity.bulkCreate(
            entradasBienConsumo.map(ent => ({
                id: ent.id,
                uuid: ent.uuid,
                documentoFuenteId: ent.documentoFuente?.id,
                almacenUuid: ent.almacen?.uuid,
                bienConsumoUuid: ent.bienConsumo?.uuid,
                cantidadEntrante: ent.cantidadEntrante
            })),
            { transaction }
        );
        

        for (const ent of entradasBienConsumo) {
            if (ent instanceof EntradaBienConsumoValorNuevo) {
                await EntradaBienConsumoValorNuevoEntity.create({
                    id: ent.id,
                    importeValorUnitario: ent.importeValorUnitario
                }, { transaction });
            }
            else if (ent instanceof EntradaBienConsumoValorSalida) {
                await EntradaBienConsumoValorSalidaEntity.create({
                    id: ent.id,
                    salidaBienConsumoId: ent.salida?.id
                }, { transaction });
            }
            else {
                throw new InternalServerErrorException('Tipo de entrada de bien de consumo invalido');
            }
        }    
    }

    async executeDeleteCollection( s: SessionData, entradasBienConsumo: EntradaBienConsumo[] )
    {
        const af1 = await EntradaBienConsumoEntity.destroy({
            where: {
                id: {
                    [Op.in]: entradasBienConsumo.map( ent => ent.id ).filter( id => id !== undefined )
                }
            },
            transaction: s.transaction
        });


        if (
            af1 === 0
        ) return 0
        else return 1;
    }


    async getCollectionByAlmacenUuidByBienConsumoUuid( s: SessionData, almacen: Almacen, bienConsumo: BienConsumo )
    {
        return await this.conectorService.executeQuery({
            target: EntradaBienConsumo.initialize,
            transaction: s.transaction,
            query: `
                ${this.query}
                where cte_entrada_bien_consumo.almacen_uuid ${almacen.uuid !== undefined ? ' = :almacenUuid ' : ' is null '}
                and cte_entrada_bien_consumo.bien_consumo_uuid ${bienConsumo.uuid !== undefined ? ' = :bienConsumoUuid ' : ' is null '}
            `,
            parameters: {
                almacenUuid: almacen.uuid ?? null,
                bienConsumoUuid: bienConsumo.uuid ?? null
            }
        });
    }


    async getRecordByIds( s: SessionData, ids: number[] )
    {
        return await this.conectorService.executeQuery({
            target: EntradaBienConsumo.initialize,
            transaction: s.transaction,
            query: `
                ${this.query}
                where cte_entrada_bien_consumo.id ${!ids.length ? ' is null ' : ' in (:ids) '}
            `,
            parameters: {
                ids: !ids.length ? null : ids
            }
        });
    }


    query = `
select cte_entrada_bien_consumo.json
from (
    select 
        entrada_bien_consumo.id as id,
        entrada_bien_consumo.uuid as uuid,
        entrada_bien_consumo.almacen_uuid as almacen_uuid,
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
        entrada_bien_consumo.almacen_uuid as almacen_uuid,
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