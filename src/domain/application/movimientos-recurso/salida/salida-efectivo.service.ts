import { NotaTransaccionSalidaCredito, SalidaEfectivo, SalidaEfectivoContado, SalidaEfectivoCredito } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { NtsCreditoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoOrm';
import { NtsCuotaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCuotaOrm';
import { SalidaEfectivoContadoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoContadoOrm';
import { SalidaEfectivoCreditoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCreditoOrm';
import { SalidaEfectivoCuotaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCuotaOrm';
import { SalidaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class SalidaEfectivoService {

    async executeCreateCollection(s: SessionData, salidasEfectivo: SalidaEfectivo[])
    {
        const transaction = s.transaction;
        
        await SalidaEfectivoOrm.bulkCreate(
            salidasEfectivo.map(sal => ({
                id: sal.id,
                uuid: sal.uuid,
                documentoFuenteId: sal.documentoFuente?.id,
                importeValorNeto: sal.importeValorNeto
            })),
            { transaction }
        );
        

        for (let i = 0; i < salidasEfectivo.length; i++) {
            const sal = salidasEfectivo[i];
            
            if (sal instanceof SalidaEfectivoContado) {
                await SalidaEfectivoContadoOrm.create({
                    id: sal.id,
                    medioTransferenciaId: sal.medioTransferencia?.id
                }, { transaction });
            }
            else if (sal instanceof SalidaEfectivoCredito) {
                await SalidaEfectivoCreditoOrm.create({
                    id: sal.id,
                    tasaInteresDiario: sal.tasaInteresDiario
                }, { transaction });
                
                if (sal.cuotas.length) {
                    await SalidaEfectivoCuotaOrm.bulkCreate(
                        sal.cuotas.map(cuota => ({
                            id: cuota.id,
                            salidaEfectivoCreditoId: sal.id,
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
            else if (sal instanceof NotaTransaccionSalidaCredito) {
                await NtsCreditoOrm.create({
                    id: sal.id,
                    notaTransaccionSalidaId: sal.documentoFuente?.id,
                    tasaInteresDiario: sal.tasaInteresDiario
                }, { transaction });
                
                if (sal.cuotas.length) {
                    await NtsCuotaOrm.bulkCreate(
                        sal.cuotas.map(cuota => ({
                            id: cuota.id,
                            ntsCreditoId: sal.id,
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