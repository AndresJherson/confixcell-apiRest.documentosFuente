import { NotaTransaccionSalidaCredito, SalidaEfectivo, SalidaEfectivoContado, SalidaEfectivoCredito } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

    async executeCreateCollection(s: SessionData, salidasEfectivo: SalidaEfectivo[])
    {
        const transaction = s.transaction;
        
        await SalidaEfectivoEntity.bulkCreate(
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
                await SalidaEfectivoContadoEntity.create({
                    id: sal.id,
                    medioTransferenciaId: sal.medioTransferencia?.id
                }, { transaction });
            }
            else if (sal instanceof SalidaEfectivoCredito) {
                await SalidaEfectivoCreditoEntity.create({
                    id: sal.id,
                    tasaInteresDiario: sal.tasaInteresDiario
                }, { transaction });
                
                if (sal.cuotas.length) {
                    await SalidaEfectivoCuotaEntity.bulkCreate(
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
                await NtsCreditoEntity.create({
                    id: sal.id,
                    notaTransaccionSalidaId: sal.documentoFuente?.id,
                    tasaInteresDiario: sal.tasaInteresDiario
                }, { transaction });
                
                if (sal.cuotas.length) {
                    await NtsCuotaEntity.bulkCreate(
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