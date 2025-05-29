import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaBienConsumoOrm } from './EntradaBienConsumoOrm';

@Table({ tableName: 'entrada_bien_consumo_valor_nuevo' })
export class EntradaBienConsumoValorNuevoOrm extends Model<EntradaBienConsumoValorNuevoOrm, Partial<EntradaBienConsumoValorNuevoOrm>> {
    @ForeignKey(() => EntradaBienConsumoOrm)
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
    

    @BelongsTo(() => EntradaBienConsumoOrm)
    declare entradaBienConsumoOrm?: EntradaBienConsumoOrm;
}