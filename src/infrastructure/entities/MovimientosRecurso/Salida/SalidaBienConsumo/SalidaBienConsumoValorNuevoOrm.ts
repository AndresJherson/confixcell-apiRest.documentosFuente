import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaBienConsumoOrm } from './SalidaBienConsumoOrm';

@Table({ tableName: 'salida_bien_consumo_valor_nuevo' })
export class SalidaBienConsumoValorNuevoOrm extends Model<SalidaBienConsumoValorNuevoOrm, Partial<SalidaBienConsumoValorNuevoOrm>> {
    @ForeignKey(() => SalidaBienConsumoOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    

    @BelongsTo(() => SalidaBienConsumoOrm)
    declare salidaBienConsumoOrm?: SalidaBienConsumoOrm;
}