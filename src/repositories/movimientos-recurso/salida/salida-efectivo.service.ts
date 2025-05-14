import { NotaTransaccionSalidaCredito, SalidaEfectivo, SalidaEfectivoContado, SalidaEfectivoCredito } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { NtsCreditoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoEntity';
import { NtsCuotaEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCuotaEntity';
import { SalidaEfectivoContadoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoContadoEntity';
import { SalidaEfectivoCreditoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCreditoEntity';
import { SalidaEfectivoCuotaEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCuotaEntity';
import { SalidaEfectivoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaEfectivoService {

    async executeCreateCollection( s: SessionData, salidasEfectivo: SalidaEfectivo[] )
    {
        await SalidaEfectivoEntity.bulkCreate( salidasEfectivo.map( sal => ({
            id: sal.id,
            documentoFuenteId: sal.documentoFuente?.id,
            importeValorNeto: sal.importeValorNeto,
            salidaEfectivoContadoEntity: sal instanceof SalidaEfectivoContado ? new SalidaEfectivoContadoEntity({
                id: sal.id,
                medioTransferenciaId: sal.medioTransferencia?.id
            }) : undefined,
            salidaEfectivoCreditoEntity: sal instanceof SalidaEfectivoCredito ? new SalidaEfectivoCreditoEntity({
                id: sal.id,
                tasaInteresDiario: sal.tasaInteresDiario,
                salidaEfectivoCuotasEntity: sal.cuotas.map( cuota => new SalidaEfectivoCuotaEntity({
                    id: cuota.id,
                    salidaEfectivoCreditoId: cuota.credito?.id,
                    numero: cuota.numero,
                    fechaInicio: cuota.fechaInicio,
                    fechaVencimiento: cuota.fechaVencimiento,
                    importeCuota: cuota.importeCuota,
                    importeAmortizacion: cuota.importeAmortizacion,
                    importeInteres: cuota.importeInteres,
                    importeSaldo: cuota.importeSaldo
                }) )
            }) : undefined,
            ntsCreditoEntity: sal instanceof NotaTransaccionSalidaCredito ? new NtsCreditoEntity({
                id: sal.id,
                notaTransaccionSalidaId: sal.documentoFuente?.id,
                tasaInteresDiario: sal.tasaInteresDiario,
                ntsCuotasEntity: sal.cuotas.map( cuota => new NtsCuotaEntity({
                    id: cuota.id,
                    ntsCreditoId: cuota.credito?.id,
                    numero: cuota.numero,
                    fechaInicio: cuota.fechaInicio,
                    fechaVencimiento: cuota.fechaVencimiento,
                    importeCuota: cuota.importeCuota,
                    importeAmortizacion: cuota.importeAmortizacion,
                    importeInteres: cuota.importeInteres,
                    importeSaldo: cuota.importeSaldo
                }) )
            }) : undefined
        }) ), {
            transaction: s.transaction,
            include: [
                SalidaEfectivoContadoEntity,
                {
                    model: SalidaEfectivoCreditoEntity,
                    include: [SalidaEfectivoCuotaEntity]
                },
                {
                    model: NtsCreditoEntity,
                    include: [NtsCuotaEntity]
                }
            ]
        } )
    }


    async executeDeleteCollection( s: SessionData, salidasEfectivo: SalidaEfectivo[] )
    {
        const af1 = await SalidaEfectivoEntity.destroy({
            where: {
                id: {
                    [Op.in]: salidasEfectivo.map( sal => sal.id ).filter( id => id !== undefined )
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