import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaBienConsumoOrm } from './SalidaBienConsumoOrm';
import { EntradaBienConsumoOrm } from '../../Entrada/EntradaBienConsumo/EntradaBienConsumoOrm';

@Table({ tableName: 'salida_bien_consumo_valor_entrada' })
export class SalidaBienConsumoValorEntradaOrm extends Model<SalidaBienConsumoValorEntradaOrm, Partial<SalidaBienConsumoValorEntradaOrm>> {
    
    @ForeignKey(() => SalidaBienConsumoOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => EntradaBienConsumoOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'entrada_bien_consumo_id'
    })
    declare entradaBienConsumoId: number;
    

    @BelongsTo(() => SalidaBienConsumoOrm)
    declare salidaBienConsumoOrm?: SalidaBienConsumoOrm;
    
    @BelongsTo(() => EntradaBienConsumoOrm)
    declare entradaBienConsumoOrm?: EntradaBienConsumoOrm;
}