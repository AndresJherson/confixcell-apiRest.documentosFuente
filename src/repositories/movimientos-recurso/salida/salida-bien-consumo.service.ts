import { NotaVentaSalidaBienConsumo, SalidaBienConsumo, SalidaBienConsumoValorEntrada, SalidaBienConsumoValorNuevo } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { NvSalidaBienConsumoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoEntity';
import { SalidaBienConsumoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoEntity';
import { SalidaBienConsumoValorEntradaEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaEntity';
import { SalidaBienConsumoValorNuevoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaBienConsumoService {

    async executeCreateCollection( s: SessionData, salidasBienConsumo: SalidaBienConsumo[] )
    {
        await SalidaBienConsumoEntity.bulkCreate( salidasBienConsumo.map( sal => ({
            id: sal.id,
            documentoFuenteId: sal.documentoFuente?.id,
            almacenUuid: sal.almacen?.uuid,
            bienConsumoUuid: sal.bienConsumo?.uuid,
            cantidad: sal.cantidad,
            importePrecioUnitario: sal.importePrecioUnitario,
            salidaBienConsumoValorNuevoEntity: sal instanceof SalidaBienConsumoValorNuevo ? new SalidaBienConsumoValorNuevoEntity({
                id: sal.id,
                importeValorUnitario: sal.importeValorUnitario
            }) : undefined,
            salidaBienConsumoValorSalidaEntity: sal instanceof SalidaBienConsumoValorEntrada ? new SalidaBienConsumoValorEntradaEntity({
                id: sal.id,
                entradaBienConsumoId: sal.entrada?.id
            }) : undefined,
            nvSalidaBienConsumoEntity: sal instanceof NotaVentaSalidaBienConsumo ? new NvSalidaBienConsumoEntity({
                id: sal.id,
                notaVentaId: sal.documentoFuente?.id,
                importeDescuento: sal.importeDescuento
            }) : undefined
        }) ), {
            transaction: s.transaction,
            include: [
                SalidaBienConsumoValorNuevoEntity,
                SalidaBienConsumoValorEntradaEntity,
                NvSalidaBienConsumoEntity
            ]
        } )
    }


    async executeDeleteCollection( s: SessionData, salidasBienConsumo: SalidaBienConsumo[] )
    {
        const af1 = await SalidaBienConsumoEntity.destroy({
            where: {
                id: {
                    [Op.in]: salidasBienConsumo.map( sal => sal.id ).filter( id => id !== undefined )
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
