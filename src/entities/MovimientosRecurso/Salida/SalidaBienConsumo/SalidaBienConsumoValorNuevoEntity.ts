import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaBienConsumoEntity } from './SalidaBienConsumoEntity';

@Table({ tableName: 'salida_bien_consumo_valor_nuevo' })
export class SalidaBienConsumoValorNuevoEntity extends Model<SalidaBienConsumoValorNuevoEntity, Partial<SalidaBienConsumoValorNuevoEntity>> {
    @ForeignKey(() => SalidaBienConsumoEntity)
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
        field: 'valor_uni'
    })
    declare importeValorUnitario: number;
    

    @BelongsTo(() => SalidaBienConsumoEntity)
    declare salidaBienConsumoEntity?: SalidaBienConsumoEntity;
}