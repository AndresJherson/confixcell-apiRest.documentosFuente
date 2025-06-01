import { NotaTransaccionSalidaCredito, SalidaEfectivo, SalidaEfectivoContado, SalidaEfectivoCredito } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NtsCreditoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoOrm';
import { NtsCuotaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCuotaOrm';
import { SalidaEfectivoContadoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoContadoOrm';
import { SalidaEfectivoCreditoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCreditoOrm';
import { SalidaEfectivoCuotaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCuotaOrm';
import { SalidaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaEfectivoService {

    async executeCreateCollection(s: SessionData, items: SalidaEfectivo[])
    {
        const transaction = s.transaction;
        const recordItems: Record<string, SalidaEfectivo> = {};
        items.forEach( item => {
            if ( item.uuid ) recordItems[item.uuid] = item;
        } );
        
        const orms = await SalidaEfectivoOrm.bulkCreate(
            items.map(item => ({
                id: item.id,
                uuid: item.uuid,
                documentoFuenteId: item.documentoFuente?.id,
                importeValorNeto: item.importeValorNeto
            })),
            { transaction }
        );
        
        orms.forEach( orm => recordItems[orm.uuid].set({...orm.get()}).setRelation() );


        for (const item of items) {
            
            if (item instanceof SalidaEfectivoContado) {
                await SalidaEfectivoContadoOrm.create({
                    id: item.id,
                    medioTransferenciaId: item.medioTransferencia?.id
                }, { transaction });
            }
            else if (item instanceof SalidaEfectivoCredito) {
                await SalidaEfectivoCreditoOrm.create({
                    id: item.id,
                    tasaInteresDiario: item.tasaInteresDiario
                }, { transaction });
                
                if (item.cuotas.length) {
                    await SalidaEfectivoCuotaOrm.bulkCreate(
                        item.cuotas.map(cuota => ({
                            salidaEfectivoCreditoId: item.id,
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
            else if (item instanceof NotaTransaccionSalidaCredito) {
                await NtsCreditoOrm.create({
                    id: item.id,
                    notaTransaccionSalidaId: item.documentoFuente?.id,
                    tasaInteresDiario: item.tasaInteresDiario
                }, { transaction });
                
                if (item.cuotas.length) {
                    await NtsCuotaOrm.bulkCreate(
                        item.cuotas.map(cuota => ({
                            ntsCreditoId: item.id,
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
            else {
                throw new InternalServerErrorException('Tipo de salida de efectivo invalido')
            }
        }
    }

}