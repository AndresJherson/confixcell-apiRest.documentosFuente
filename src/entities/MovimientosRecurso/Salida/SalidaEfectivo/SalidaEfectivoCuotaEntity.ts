import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaEfectivoCreditoEntity } from './SalidaEfectivoCreditoEntity';

@Table({ tableName: 'salida_efectivo_cuota' })
export class SalidaEfectivoCuotaEntity extends Model<SalidaEfectivoCuotaEntity, Partial<SalidaEfectivoCuotaEntity>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => SalidaEfectivoCreditoEntity)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'salida_efectivo_credito_id'
    })
    declare salidaEfectivoCreditoId: number;
    
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    declare numero: number;
    
    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'f_inicio'
    })
    declare fechaInicio: string;
    
    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'f_vencimiento'
    })
    declare fechaVencimiento: string;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'cuota'
    })
    declare importeCuota: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'amortizacion'
    })
    declare importeAmortizacion: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'interes'
    })
    declare importeInteres: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'saldo'
    })
    declare importeSaldo: number;
    

    @BelongsTo(() => SalidaEfectivoCreditoEntity)
    declare salidaEfectivoCreditoEntity?: SalidaEfectivoCreditoEntity;
}