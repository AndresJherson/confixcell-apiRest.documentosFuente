import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NteCreditoOrm } from './NteCreditoOrm';

@Table({ tableName: 'nte_cuota' })
export class NteCuotaOrm extends Model<NteCuotaOrm, Partial<NteCuotaOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @ForeignKey(() => NteCreditoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nte_credito_id' })
    declare nteCreditoId: number;

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
    

    @BelongsTo(() => NteCreditoOrm)
    declare nteCreditoOrm?: NteCreditoOrm;
}