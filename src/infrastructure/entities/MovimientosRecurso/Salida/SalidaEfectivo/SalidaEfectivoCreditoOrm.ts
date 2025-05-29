import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { SalidaEfectivoOrm } from './SalidaEfectivoOrm';
import { SalidaEfectivoCuotaOrm } from './SalidaEfectivoCuotaOrm';

@Table({ tableName: 'salida_efectivo_credito' })
export class SalidaEfectivoCreditoOrm extends Model<SalidaEfectivoCreditoOrm, Partial<SalidaEfectivoCreditoOrm>> {
    
    @ForeignKey(() => SalidaEfectivoOrm)
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
    

    @BelongsTo(() => SalidaEfectivoOrm)
    declare salidaEfectivoOrm?: SalidaEfectivoOrm;
    
    @HasMany(() => SalidaEfectivoCuotaOrm)
    declare salidaEfectivoCuotasOrm?: SalidaEfectivoCuotaOrm[];
}