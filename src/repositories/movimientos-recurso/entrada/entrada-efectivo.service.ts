import { EntradaEfectivo, EntradaEfectivoContado, EntradaEfectivoCredito, NotaTransaccionEntradaCredito, NotaVentaEntradaEfectivo } from '@confixcell/modelos';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { NteCreditoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoEntity';
import { NteCuotaEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCuotaEntity';
import { NvEntradaEfectivoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoEntity';
import { EntradaEfectivoContadoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoContadoEntity';
import { EntradaEfectivoCreditoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCreditoEntity';
import { EntradaEfectivoCuotaEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCuotaEntity';
import { EntradaEfectivoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoEntity';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class EntradaEfectivoService {

    async executeCreateCollection( s: SessionData, entradasEfectivo: EntradaEfectivo[] )
    {
        await EntradaEfectivoEntity.bulkCreate( entradasEfectivo.map( ent => ({
            id: ent.id,
            documentoFuenteId: ent.documentoFuente?.id,
            importeValorNeto: ent.importeValorNeto,
            entradaEfectivoContadoEntity: ent instanceof EntradaEfectivoContado ? new EntradaEfectivoContadoEntity({
                id: ent.id,
                medioTransferenciaId: ent.medioTransferencia?.id
            }) : undefined,
            entradaEfectivoCreditoEntity: ent instanceof EntradaEfectivoCredito ? new EntradaEfectivoCreditoEntity({
                id: ent.id,
                tasaInteresDiario: ent.tasaInteresDiario,
                cuotasEntity: ent.cuotas.map( cuota => new EntradaEfectivoCuotaEntity({
                    id: cuota.id,
                    entradaEfectivoCreditoId: cuota.credito?.id,
                    numero: cuota.numero,
                    fechaInicio: cuota.fechaInicio,
                    fechaVencimiento: cuota.fechaVencimiento,
                    importeCuota: cuota.importeCuota,
                    importeAmortizacion: cuota.importeAmortizacion,
                    importeInteres: cuota.importeInteres,
                    importeSaldo: cuota.importeSaldo
                }) )
            }) : undefined,
            nteCreditoEntity: ent instanceof NotaTransaccionEntradaCredito ? new NteCreditoEntity({
                id: ent.id,
                notaTransaccionEntradaId: ent.documentoFuente?.id,
                tasaInteresDiario: ent.tasaInteresDiario,
                nteCuotasEntity: ent.cuotas.map( cuota => new NteCuotaEntity({
                    id: cuota.id,
                    nteCreditoId: cuota.credito?.id,
                    numero: cuota.numero,
                    fechaInicio: cuota.fechaInicio,
                    fechaVencimiento: cuota.fechaVencimiento,
                    importeCuota: cuota.importeCuota,
                    importeAmortizacion: cuota.importeAmortizacion,
                    importeInteres: cuota.importeInteres,
                    importeSaldo: cuota.importeSaldo
                }) )
            }) : undefined,
            nvEntradaEfectivoEntity: ent instanceof NotaVentaEntradaEfectivo ? new NvEntradaEfectivoEntity({
                id: ent.id,
                notaVentaId: ent.documentoFuente?.id,
                numero: ent.numero,
                fecha: ent.fecha,
                medioTransferenciaId: ent.medioTransferencia?.id
            }) : undefined
        }) ), {
            transaction: s.transaction,
            include: [
                EntradaEfectivoContadoEntity,
                {
                    model: EntradaEfectivoCreditoEntity,
                    include: [EntradaEfectivoCuotaEntity]
                },
                {
                    model: NteCreditoEntity,
                    include: [NteCuotaEntity]
                },
                NvEntradaEfectivoEntity
            ]
        } )
    }


    async executeDeleteCollection( s: SessionData, entradasEfectivo: EntradaEfectivo[] )
    {
        const af1 = await EntradaEfectivoEntity.destroy({
            where: {
                id: {
                    [Op.in]: entradasEfectivo.map( ent => ent.id ).filter( id => id !== undefined )
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