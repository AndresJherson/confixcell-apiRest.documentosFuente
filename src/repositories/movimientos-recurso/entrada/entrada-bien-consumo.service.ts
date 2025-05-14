import { EntradaBienConsumo, EntradaBienConsumoValorNuevo, EntradaBienConsumoValorSalida } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { EntradaBienConsumoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoEntity';
import { EntradaBienConsumoValorNuevoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorNuevoEntity';
import { EntradaBienConsumoValorSalidaEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class EntradaBienConsumoService {

    async executeCreateCollection( s: SessionData, entradasBienConsumo: EntradaBienConsumo[] )
    {
        await EntradaBienConsumoEntity.bulkCreate( entradasBienConsumo.map( ent => ({
            id: ent.id,
            documentoFuenteId: ent.documentoFuente?.id,
            almacenUuid: ent.almacen?.uuid,
            bienConsumoUuid: ent.bienConsumo?.uuid,
            cantidad: ent.cantidad,
            entradaBienConsumoValorNuevoEntity: ent instanceof EntradaBienConsumoValorNuevo ? new EntradaBienConsumoValorNuevoEntity({
                id: ent.id,
                importeValorUnitario: ent.importeValorUnitario
            }) : undefined,
            entradaBienConsumoValorSalidaEntity: ent instanceof EntradaBienConsumoValorSalida ? new EntradaBienConsumoValorSalidaEntity({
                id: ent.id,
                salidaBienConsumoId: ent.salida?.id
            }) : undefined
        }) ), {
            transaction: s.transaction,
            include: [
                EntradaBienConsumoEntity,
                EntradaBienConsumoValorSalidaEntity
            ]
        } )
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

}
