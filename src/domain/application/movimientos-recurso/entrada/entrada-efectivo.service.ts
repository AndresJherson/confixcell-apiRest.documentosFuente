import { EntradaEfectivo, EntradaEfectivoContado, EntradaEfectivoCredito, NotaTransaccionEntradaCredito, NotaVentaEntradaEfectivo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { NteCreditoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoOrm';
import { NteCuotaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCuotaOrm';
import { NvEntradaEfectivoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoOrm';
import { EntradaEfectivoContadoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoContadoOrm';
import { EntradaEfectivoCreditoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCreditoOrm';
import { EntradaEfectivoCuotaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCuotaOrm';
import { EntradaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class EntradaEfectivoService {

    async executeCreateCollection( s: SessionData, items: EntradaEfectivo[] )
    {
        const transaction = s.transaction;
        const recordItems: Record<string, EntradaEfectivo> = {};
        items.forEach( item => {
            if ( item.uuid ) recordItems[item.uuid] = item;
        } );
        
        const orms = await EntradaEfectivoOrm.bulkCreate(
            items.map(item => ({
                uuid: item.uuid,
                documentoFuenteId: item.documentoFuente?.id,
                importeValorNeto: item.importeValorNeto
            })),
            { transaction }
        );

        orms.forEach( orm => recordItems[orm.uuid].set({...orm.get()}).setRelation() );
        
        
        for (const item of items) {
            
            if (item instanceof EntradaEfectivoContado) {
                await EntradaEfectivoContadoOrm.create({
                    id: item.id,
                    medioTransferenciaId: item.medioTransferencia?.id
                }, { transaction });
            }
            else if (item instanceof EntradaEfectivoCredito) {
                await EntradaEfectivoCreditoOrm.create({
                    id: item.id,
                    tasaInteresDiario: item.tasaInteresDiario
                }, { transaction });
                
                if (item.cuotas.length) {
                    await EntradaEfectivoCuotaOrm.bulkCreate(
                        item.cuotas.map(cuota => ({
                            entradaEfectivoCreditoId: item.id,
                            numero: cuota.numero,
                            fechaInicio: cuota.fechaInicio,
                            fechaVencimiento: cuota.fechaVencimiento,
                            importeCuota: cuota.importeCuota,
                            importeAmortizacion: cuota.importeAmortizacion,
                            importeInteres: cuota.importeInteres,
                            importeSaldo: cuota.importeSaldo
                        })),
                        { transaction }
                    );
                }
            }
            else if (item instanceof NotaTransaccionEntradaCredito) {
                await NteCreditoOrm.create({
                    id: item.id,
                    notaTransaccionEntradaId: item.documentoFuente?.id,
                    tasaInteresDiario: item.tasaInteresDiario
                }, { transaction });
                
                if (item.cuotas.length) {
                    await NteCuotaOrm.bulkCreate(
                        item.cuotas.map(cuota => ({
                            nteCreditoId: item.id,
                            numero: cuota.numero,
                            fechaInicio: cuota.fechaInicio,
                            fechaVencimiento: cuota.fechaVencimiento,
                            importeCuota: cuota.importeCuota,
                            importeAmortizacion: cuota.importeAmortizacion,
                            importeInteres: cuota.importeInteres,
                            importeSaldo: cuota.importeSaldo
                        })),
                        { transaction }
                    );
                }
            }
            else if (item instanceof NotaVentaEntradaEfectivo) {
                await NvEntradaEfectivoOrm.create({
                    id: item.id,
                    notaVentaId: item.documentoFuente?.id,
                    numero: item.numero,
                    fecha: item.fecha,
                    medioTransferenciaId: item.medioTransferencia?.id
                }, { transaction });
            }
            else {
                throw new InternalServerErrorException( 'Tipo de entrada de efectivo invalido' )
            }
        }
    }
}