import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaTransaccionEntradaEntity } from './NotaTransaccionEntradaEntity';
import { EntradaEfectivoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoEntity';
import { NteCuotaEntity } from './NteCuotaEntity';

@Table({ tableName: 'nte_credito' })
export class NteCreditoEntity extends Model<NteCreditoEntity, Partial<NteCreditoEntity>> 
{
    @ForeignKey(() => EntradaEfectivoEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaTransaccionEntradaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_transaccion_entrada_id' })
    declare notaTransaccionEntradaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'tasa_interes_diario' })
    declare tasaInteresDiario: number;


    @BelongsTo(() => EntradaEfectivoEntity)
    declare entradaEfectivoEntity?: EntradaEfectivoEntity;

    @BelongsTo(() => NotaTransaccionEntradaEntity)
    declare notaTransaccionEntradaEntity?: NotaTransaccionEntradaEntity;

    @HasMany(() => NteCuotaEntity)
    declare nteCuotasEntity?: NteCuotaEntity[];
}