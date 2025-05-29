import { NotaVentaSalidaProduccionServicioReparacion, SalidaProduccion, SalidaProduccionServicio } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { NvServicioReparacionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionOrm';
import { NvServicioReparacionRecursoBienConsumoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoBienConsumoOrm';
import { NvServicioReparacionRecursoServicioOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoServicioOrm';
import { SalidaProduccionOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionOrm';
import { SalidaProduccionServicioOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaProduccionRepository {

    async executeCreateCollection( s: SessionData, salidasProduccion: SalidaProduccion[] )
    {
        const transaction = s.transaction;
        const nvSalidasProduccionServicioReparacion = salidasProduccion.filter( sal => sal instanceof NotaVentaSalidaProduccionServicioReparacion );

        if ( nvSalidasProduccionServicioReparacion.length ) {
            await SalidaProduccionOrm.bulkCreate(
                nvSalidasProduccionServicioReparacion.map( sal => ({
                    id: sal.id,
                    documentoFuenteId: sal.documentoFuente?.id,
                    importePrecioNeto: sal.importePrecioNeto
                }) ),
                { transaction: transaction }
            );
            await SalidaProduccionServicioOrm.bulkCreate(
                nvSalidasProduccionServicioReparacion.map( sal => ({
                    id: sal.id,
                    servicioUuid: sal.servicio?.uuid,
                }),
                { transaction: transaction }
            ) )
            await NvServicioReparacionOrm.bulkCreate(
                nvSalidasProduccionServicioReparacion.map( sal => ({
                    id: sal.id,
                    notaVentaId: sal.documentoFuente?.id,
                    pantallaModeloUuid: sal.pantallaModelo?.uuid,
                    imei: sal.imei,
                    patron: sal.patron,
                    contrasena: sal.contrasena,
                    problema: sal.problema
                }) ),
                { transaction: transaction }
            )

            const recursosBienConsumo = nvSalidasProduccionServicioReparacion.flatMap( sal => sal.recursosBienConsumo );
            if ( recursosBienConsumo.length ) {
                await NvServicioReparacionRecursoBienConsumoOrm.bulkCreate(
                    recursosBienConsumo.map( recurso => ({
                        id: recurso.id,
                        uuid: recurso.uuid,
                        nvServicioReparacionId: recurso.salidaProduccion?.id,
                        almacenUuid: recurso.almacen?.uuid,
                        bienConsumoUuid: recurso.bienConsumo?.uuid,
                        fecha: recurso.fecha,
                        cantidad: recurso.cantidad,
                        importePrecioUnitario: recurso.importePrecioUnitario
                    }),
                    { transaction: transaction }
                ) )
            }

            const recursosServicio = nvSalidasProduccionServicioReparacion.flatMap( sal => sal.recursosServicio );
            if ( recursosServicio.length ) {
                await NvServicioReparacionRecursoServicioOrm.bulkCreate(
                    recursosServicio.map( recurso => ({
                        id: recurso.id,
                        uuid: recurso.uuid,
                        nvServicioReparacionId: recurso.salidaProduccion?.id,
                        nvCategoriaReparacionId: recurso.categoriaReparacion?.id,
                        descripcion: recurso.descripcion,
                        fechaInicio: recurso.fechaInicio,
                        fechaFinal: recurso.fechaFinal,
                        importePrecio: recurso.importePrecio
                    }),
                    { transaction: transaction }
                ) )
            }
        }
    }


    async executeDeleteCollection( s: SessionData, salidasProduccion: SalidaProduccion[] )
    {
        const af1 = await SalidaProduccionOrm.destroy({
            where: {
                id: {
                    [Op.in]: salidasProduccion.map( sal => sal.id ).filter( id => id !== undefined )
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
