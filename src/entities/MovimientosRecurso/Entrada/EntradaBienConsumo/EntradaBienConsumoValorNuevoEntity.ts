import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaBienConsumoEntity } from './EntradaBienConsumoEntity';

@Table({ tableName: 'entrada_bien_consumo_valor_nuevo' })
export class EntradaBienConsumoValorNuevoEntity extends Model<EntradaBienConsumoValorNuevoEntity, Partial<EntradaBienConsumoValorNuevoEntity>> {
    @ForeignKey(() => EntradaBienConsumoEntity)
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
    

    @BelongsTo(() => EntradaBienConsumoEntity)
    declare entradaBienConsumoEntity?: EntradaBienConsumoEntity;
}