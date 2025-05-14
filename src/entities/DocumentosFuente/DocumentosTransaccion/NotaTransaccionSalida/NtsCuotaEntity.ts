import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NtsCreditoEntity } from './NtsCreditoEntity';

@Table({ tableName: 'nts_cuota' })
export class NtsCuotaEntity extends Model<NtsCuotaEntity, Partial<NtsCuotaEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NtsCreditoEntity)
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


    @BelongsTo(() => NtsCreditoEntity)
    declare creditoEntity?: NtsCreditoEntity;
}