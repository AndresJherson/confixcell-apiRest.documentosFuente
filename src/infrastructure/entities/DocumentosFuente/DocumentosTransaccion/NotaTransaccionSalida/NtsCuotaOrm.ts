import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NtsCreditoOrm } from './NtsCreditoOrm';

@Table({ tableName: 'nts_cuota' })
export class NtsCuotaOrm extends Model<NtsCuotaOrm, Partial<NtsCuotaOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NtsCreditoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nts_credito_id' })
    declare ntsCreditoId: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare numero: number;

    @Column({ type: DataType.DATE, field: 'f_inicio' })
    declare fechaInicio?: string;

    @Column({ type: DataType.DATE, field: 'f_vencimiento' })
    declare fechaVencimiento?: string;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'cuota' })
    declare importeCuota: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'amortizacion' })
    declare importeAmortizacion: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'interes' })
    declare importeInteres: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'saldo' })
    declare importeSaldo: number;


    @BelongsTo(() => NtsCreditoOrm)
    declare creditoOrm?: NtsCreditoOrm;
}