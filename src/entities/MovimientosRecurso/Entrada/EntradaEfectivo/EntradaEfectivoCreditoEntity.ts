import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { EntradaEfectivoEntity } from './EntradaEfectivoEntity';
import { EntradaEfectivoCuotaEntity } from './EntradaEfectivoCuotaEntity';

@Table({ tableName: 'entrada_efectivo_credito' })
export class EntradaEfectivoCreditoEntity extends Model<EntradaEfectivoCreditoEntity, Partial<EntradaEfectivoCreditoEntity>> {
    @ForeignKey(() => EntradaEfectivoEntity)
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
    

    @BelongsTo(() => EntradaEfectivoEntity)
    declare entradaEfectivoEntity?: EntradaEfectivoEntity;
    
    @HasMany(() => EntradaEfectivoCuotaEntity)
    declare cuotasEntity?: EntradaEfectivoCuotaEntity[];
}