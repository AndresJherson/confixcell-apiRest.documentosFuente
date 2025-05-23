import { NotaVentaSalidaBienConsumo, SalidaBienConsumo, SalidaBienConsumoValorEntrada, SalidaBienConsumoValorNuevo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { NvSalidaBienConsumoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoEntity';
import { SalidaBienConsumoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoEntity';
import { SalidaBienConsumoValorEntradaEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaEntity';
import { SalidaBienConsumoValorNuevoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaBienConsumoService {

    async executeCreateCollection(s: SessionData, salidasBienConsumo: SalidaBienConsumo[])
    {
        const transaction = s.transaction;
        
        await SalidaBienConsumoEntity.bulkCreate(
            salidasBienConsumo.map(sal => ({
                id: sal.id,
                uuid: sal.uuid,
                documentoFuenteId: sal.documentoFuente?.id,
                almacenUuid: sal.almacen?.uuid,
                bienConsumoUuid: sal.bienConsumo?.uuid,
                cantidadSaliente: sal.cantidadSaliente,
                importePrecioUnitario: sal.importePrecioUnitario
            })),
            { transaction }
        );
        

        for (const sal of salidasBienConsumo) {
            if (sal instanceof SalidaBienConsumoValorNuevo) {
                await SalidaBienConsumoValorNuevoEntity.create({
                    id: sal.id
                }, { transaction });
            }
            else if (sal instanceof SalidaBienConsumoValorEntrada) {
                await SalidaBienConsumoValorEntradaEntity.create({
                    id: sal.id,
                    entradaBienConsumoId: sal.entrada?.id
                }, { transaction });
            }
            else if (sal instanceof NotaVentaSalidaBienConsumo) {
                await NvSalidaBienConsumoEntity.create({
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
