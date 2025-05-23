import { EntradaEfectivo, EntradaEfectivoContado, EntradaEfectivoCredito, NotaTransaccionEntradaCredito, NotaVentaEntradaEfectivo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
        const transaction = s.transaction;
        
        await EntradaEfectivoEntity.bulkCreate(
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
                await EntradaEfectivoContadoEntity.create({
                    id: ent.id,
                    medioTransferenciaId: ent.medioTransferencia?.id
                }, { transaction });
            }
            else if (ent instanceof EntradaEfectivoCredito) {
                await EntradaEfectivoCreditoEntity.create({
                    id: ent.id,
                    tasaInteresDiario: ent.tasaInteresDiario
                }, { transaction });
                
                if (ent.cuotas.length) {
                    await EntradaEfectivoCuotaEntity.bulkCreate(
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
                await NteCreditoEntity.create({
                    id: ent.id,
                    notaTransaccionEntradaId: ent.documentoFuente?.id,
                    tasaInteresDiario: ent.tasaInteresDiario
                }, { transaction });
                
                if (ent.cuotas.length) {
                    await NteCuotaEntity.bulkCreate(
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
                await NvEntradaEfectivoEntity.create({
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