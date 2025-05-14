import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaTransaccionSalidaEntity } from './NotaTransaccionSalidaEntity';
import { SalidaEfectivoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoEntity';
import { NtsCuotaEntity } from './NtsCuotaEntity';

@Table({ tableName: 'nts_credito' })
export class NtsCreditoEntity extends Model<NtsCreditoEntity, Partial<NtsCreditoEntity>> 
{
    @ForeignKey(() => SalidaEfectivoEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaTransaccionSalidaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_transaccion_salida_id' })
    declare notaTransaccionSalidaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'tasa_interes_diario' })
    declare tasaInteresDiario: number;

 
    @BelongsTo(() => SalidaEfectivoEntity)
    declare salidaEfectivoEntity?: SalidaEfectivoEntity;

    @BelongsTo(() => NotaTransaccionSalidaEntity)
    declare notaTransaccionSalidaEntity?: NotaTransaccionSalidaEntity;

    @HasMany(() => NtsCuotaEntity)
    declare ntsCuotasEntity?: NtsCuotaEntity[];
}