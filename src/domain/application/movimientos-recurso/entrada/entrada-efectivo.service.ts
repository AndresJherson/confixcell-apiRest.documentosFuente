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

    async executeCreateCollection( s: SessionData, entradasEfectivo: EntradaEfectivo[] )
    {
        const transaction = s.transaction;
        
        await EntradaEfectivoOrm.bulkCreate(
            entradasEfectivo.map(ent => ({
                id: ent.id,
                uuid: ent.uuid,
                documentoFuenteId: ent.documentoFuente?.id,
                importeValorNeto: ent.importeValorNeto
            })),
            { transaction }
        );
        

        for (let i = 0; i < entradasEfectivo.length; i++) {
            const ent = entradasEfectivo[i];
            
            if (ent instanceof EntradaEfectivoContado) {
                await EntradaEfectivoContadoOrm.create({
                    id: ent.id,
                    medioTransferenciaId: ent.medioTransferencia?.id
                }, { transaction });
            }
            else if (ent instanceof EntradaEfectivoCredito) {
                await EntradaEfectivoCreditoOrm.create({
                    id: ent.id,
                    tasaInteresDiario: ent.tasaInteresDiario
                }, { transaction });
                
                if (ent.cuotas.length) {
                    await EntradaEfectivoCuotaOrm.bulkCreate(
                        ent.cuotas.map(cuota => ({
                            id: cuota.id,
                            entradaEfectivoCreditoId: ent.id,
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
            else if (ent instanceof NotaTransaccionEntradaCredito) {
                await NteCreditoOrm.create({
                    id: ent.id,
                    notaTransaccionEntradaId: ent.documentoFuente?.id,
                    tasaInteresDiario: ent.tasaInteresDiario
                }, { transaction });
                
                if (ent.cuotas.length) {
                    await NteCuotaOrm.bulkCreate(
                        ent.cuotas.map(cuota => ({
                            id: cuota.id,
                            nteCreditoId: ent.id,
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
            else if (ent instanceof NotaVentaEntradaEfectivo) {
                await NvEntradaEfectivoOrm.create({
                    id: ent.id,
                    notaVentaId: ent.documentoFuente?.id,
                    numero: ent.numero,
                    fecha: ent.fecha,
                    medioTransferenciaId: ent.medioTransferencia?.id
                }, { transaction });
            }
            else {
                throw new InternalServerErrorException( 'Tipo de entrada de efectivo invalido' )
            }
        }
    }
}