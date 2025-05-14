import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { SalidaEfectivoEntity } from './SalidaEfectivoEntity';
import { SalidaEfectivoCuotaEntity } from './SalidaEfectivoCuotaEntity';

@Table({ tableName: 'salida_efectivo_credito' })
export class SalidaEfectivoCreditoEntity extends Model<SalidaEfectivoCreditoEntity, Partial<SalidaEfectivoCreditoEntity>> {
    
    @ForeignKey(() => SalidaEfectivoEntity)
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
    

    @BelongsTo(() => SalidaEfectivoEntity)
    declare salidaEfectivoEntity?: SalidaEfectivoEntity;
    
    @HasMany(() => SalidaEfectivoCuotaEntity)
    declare salidaEfectivoCuotasEntity?: SalidaEfectivoCuotaEntity[];
}