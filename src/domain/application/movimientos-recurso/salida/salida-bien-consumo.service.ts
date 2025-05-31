import { NotaVentaSalidaBienConsumo, SalidaBienConsumo, SalidaBienConsumoValorEntrada, SalidaBienConsumoValorNuevo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { NvSalidaBienConsumoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoOrm';
import { SalidaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';
import { SalidaBienConsumoValorEntradaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaOrm';
import { SalidaBienConsumoValorNuevoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaBienConsumoService {

    async executeCreateCollection(s: SessionData, salidasBienConsumo: SalidaBienConsumo[])
    {
        const transaction = s.transaction;
        
        await SalidaBienConsumoOrm.bulkCreate(
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
}
