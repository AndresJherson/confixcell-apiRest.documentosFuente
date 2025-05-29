import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaTransaccionSalidaOrm } from './NotaTransaccionSalidaOrm';
import { NtsCuotaOrm } from './NtsCuotaOrm';
import { SalidaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoOrm';

@Table({ tableName: 'nts_credito' })
export class NtsCreditoOrm extends Model<NtsCreditoOrm, Partial<NtsCreditoOrm>> 
{
    @ForeignKey(() => SalidaEfectivoOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaTransaccionSalidaOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_transaccion_salida_id' })
    declare notaTransaccionSalidaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'tasa_interes_diario' })
    declare tasaInteresDiario: number;

 
    @BelongsTo(() => SalidaEfectivoOrm)
    declare salidaEfectivoOrm?: SalidaEfectivoOrm;

    @BelongsTo(() => NotaTransaccionSalidaOrm)
    declare notaTransaccionSalidaOrm?: NotaTransaccionSalidaOrm;

    @HasMany(() => NtsCuotaOrm)
    declare ntsCuotasOrm?: NtsCuotaOrm[];
}