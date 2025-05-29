import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { EntradaEfectivoOrm } from './EntradaEfectivoOrm';
import { EntradaEfectivoCuotaOrm } from './EntradaEfectivoCuotaOrm';

@Table({ tableName: 'entrada_efectivo_credito' })
export class EntradaEfectivoCreditoOrm extends Model<EntradaEfectivoCreditoOrm, Partial<EntradaEfectivoCreditoOrm>> {
    @ForeignKey(() => EntradaEfectivoOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tasa_interes_diario'
    })
    declare tasaInteresDiario: number;
    

    @BelongsTo(() => EntradaEfectivoOrm)
    declare entradaEfectivoOrm?: EntradaEfectivoOrm;
    
    @HasMany(() => EntradaEfectivoCuotaOrm)
    declare entradaEfectivoCuotasOrm?: EntradaEfectivoCuotaOrm[];
}