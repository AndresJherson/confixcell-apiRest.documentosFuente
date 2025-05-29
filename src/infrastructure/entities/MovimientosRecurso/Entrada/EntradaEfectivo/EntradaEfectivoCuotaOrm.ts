import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaEfectivoCreditoOrm } from './EntradaEfectivoCreditoOrm';

@Table({ tableName: 'entrada_efectivo_cuota' })
export class EntradaEfectivoCuotaOrm extends Model<EntradaEfectivoCuotaOrm, Partial<EntradaEfectivoCuotaOrm>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => EntradaEfectivoCreditoOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'entrada_efectivo_credito_id'
    })
    declare entradaEfectivoCreditoId: number;
    
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

    
    @BelongsTo(() => EntradaEfectivoCreditoOrm)
    declare creditoOrm?: EntradaEfectivoCreditoOrm;
}