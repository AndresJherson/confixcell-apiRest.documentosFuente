import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaBienConsumoOrm } from './EntradaBienConsumoOrm';
import { SalidaBienConsumoOrm } from '../../Salida/SalidaBienConsumo/SalidaBienConsumoOrm';

@Table({ tableName: 'entrada_bien_consumo_valor_salida' })
export class EntradaBienConsumoValorSalidaOrm extends Model<EntradaBienConsumoValorSalidaOrm, Partial<EntradaBienConsumoValorSalidaOrm>> {
    @ForeignKey(() => EntradaBienConsumoOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => SalidaBienConsumoOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'salida_bien_consumo_id'
    })
    declare salidaBienConsumoId: number;
    

    @BelongsTo(() => EntradaBienConsumoOrm)
    declare entradaBienConsumoOrm?: EntradaBienConsumoOrm;
    
    @BelongsTo(() => SalidaBienConsumoOrm)
    declare salidaBienConsumoOrm?: SalidaBienConsumoOrm;
}