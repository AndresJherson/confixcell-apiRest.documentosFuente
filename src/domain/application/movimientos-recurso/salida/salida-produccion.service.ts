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
export class SalidaProduccionService {

    async executeCreateCollection( s: SessionData, salidasProduccion: SalidaProduccion[] )
    {
        const transaction = s.transaction;
        const salidasServicioReparacion = salidasProduccion.filter( sal => sal instanceof NotaVentaSalidaProduccionServicioReparacion );
        const recordItems: Record<string, NotaVentaSalidaProduccionServicioReparacion> = {};
        salidasServicioReparacion.forEach( sal => {
            if ( sal.uuid ) recordItems[sal.uuid] = sal;
        } );

        if ( salidasServicioReparacion.length ) {
            const orms = await SalidaProduccionOrm.bulkCreate(
                salidasServicioReparacion.map( sal => ({
                    documentoFuenteId: sal.documentoFuente?.id,
                    importePrecioNeto: sal.importePrecioNeto
                }) ),
                { transaction: transaction }
            );

            orms.forEach( orm => recordItems[orm.uuid].set({...orm.get()}).setRelation() )

            await SalidaProduccionServicioOrm.bulkCreate(
                salidasServicioReparacion.map( sal => ({
                    id: sal.id,
                    servicioUuid: sal.servicio?.uuid,
                }),
                { transaction: transaction }
            ) )
            await NvServicioReparacionOrm.bulkCreate(
                salidasServicioReparacion.map( sal => ({
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

            const recursosBienConsumo = salidasServicioReparacion.flatMap( sal => sal.recursosBienConsumo );
            if ( recursosBienConsumo.length ) {
                await NvServicioReparacionRecursoBienConsumoOrm.bulkCreate(
                    recursosBienConsumo.map( recurso => ({
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

            const recursosServicio = salidasServicioReparacion.flatMap( sal => sal.recursosServicio );
            if ( recursosServicio.length ) {
                await NvServicioReparacionRecursoServicioOrm.bulkCreate(
                    recursosServicio.map( recurso => ({
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
}
