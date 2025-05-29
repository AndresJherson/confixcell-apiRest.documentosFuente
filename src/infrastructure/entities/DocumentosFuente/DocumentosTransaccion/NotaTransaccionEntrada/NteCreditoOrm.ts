import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaTransaccionEntradaOrm } from './NotaTransaccionEntradaOrm';
import { NteCuotaOrm } from './NteCuotaOrm';
import { EntradaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoOrm';

@Table({ tableName: 'nte_credito' })
export class NteCreditoOrm extends Model<NteCreditoOrm, Partial<NteCreditoOrm>> 
{
    @ForeignKey(() => EntradaEfectivoOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaTransaccionEntradaOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_transaccion_entrada_id' })
    declare notaTransaccionEntradaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'tasa_interes_diario' })
    declare tasaInteresDiario: number;


    @BelongsTo(() => EntradaEfectivoOrm)
    declare entradaEfectivoOrm?: EntradaEfectivoOrm;

    @BelongsTo(() => NotaTransaccionEntradaOrm)
    declare notaTransaccionEntradaOrm?: NotaTransaccionEntradaOrm;

    @HasMany(() => NteCuotaOrm)
    declare nteCuotasOrm?: NteCuotaOrm[];
}