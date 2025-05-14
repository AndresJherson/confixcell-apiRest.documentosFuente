import { NotaVentaSalidaProduccionServicioReparacion, SalidaProduccion, SalidaProduccionServicio } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { NvServicioReparacionEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionEntity';
import { NvServicioReparacionRecursoBienConsumoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoBienConsumoEntity';
import { NvServicioReparacionRecursoServicioEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoServicioEntity';
import { SalidaProduccionEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionEntity';
import { SalidaProduccionServicioEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaProduccionService {

    async executeCreateCollection( s: SessionData, salidasProduccion: SalidaProduccion[] )
    {
        await SalidaProduccionEntity.bulkCreate( salidasProduccion.map( sal => ({
            id: sal.id,
            documentoFuenteId: sal.documentoFuente?.id,
            importePrecioNeto: sal.importePrecioNeto,
            salidaProduccionServicioEntity: sal instanceof SalidaProduccionServicio ? new SalidaProduccionServicioEntity({
                id: sal.id,
                servicioUuid: sal.servicio?.uuid,
                nvServicioReparacionEntity: sal instanceof NotaVentaSalidaProduccionServicioReparacion ? new NvServicioReparacionEntity({
                    id: sal.id,
                    notaVentaId: sal.documentoFuente?.id,
                    pantallaModeloUuid: sal.pantallaModelo?.uuid,
                    imei: sal.imei,
                    patron: sal.patron,
                    contrasena: sal.contrasena,
                    problema: sal.problema,
                    nvServicioReparacionRecursosBienConsumoEntity: sal.recursosBienConsumo.map( recurso => new NvServicioReparacionRecursoBienConsumoEntity({
                        id: recurso.id,
                        nvServicioReparacionId: recurso.salidaProduccion?.id,
                        almacenUuid: recurso.almacen?.uuid,
                        bienConsumoUuid: recurso.bienConsumo?.uuid,
                        fecha: recurso.fecha,
                        cantidad: recurso.cantidad,
                        importePrecioUnitario: recurso.importePrecioUnitario
                    }) ),
                    nvServicioReparacionRecursosServicioEntity: sal.recursosServicio.map( recurso => new NvServicioReparacionRecursoServicioEntity({
                        id: recurso.id,
                        nvServicioReparacionId: recurso.salidaProduccion?.id,
                        nvCategoriaReparacionId: recurso.categoriaReparacion?.id,
                        descripcion: recurso.descripcion,
                        fechaInicio: recurso.fechaInicio,
                        fechaFinal: recurso.fechaFinal,
                        importePrecio: recurso.importePrecio
                    }) )
                }) : undefined
            }) : undefined
        }) ), {
            transaction: s.transaction,
            include: [
                {
                    model: SalidaProduccionServicioEntity,
                    include: [
                        {
                            model: NvServicioReparacionEntity,
                            include: [
                                NvServicioReparacionRecursoBienConsumoEntity,
                                NvServicioReparacionRecursoServicioEntity
                            ]
                        }
                    ]
                }
            ]
        } )
    }


    async executeDeleteCollection( s: SessionData, salidasProduccion: SalidaProduccion[] )
    {
        const af1 = await SalidaProduccionEntity.destroy({
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
