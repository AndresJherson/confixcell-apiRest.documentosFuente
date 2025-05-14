import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaBienConsumoEntity } from './SalidaBienConsumoEntity';
import { EntradaBienConsumoEntity } from '../../Entrada/EntradaBienConsumo/EntradaBienConsumoEntity';

@Table({ tableName: 'salida_bien_consumo_valor_entrada' })
export class SalidaBienConsumoValorEntradaEntity extends Model<SalidaBienConsumoValorEntradaEntity, Partial<SalidaBienConsumoValorEntradaEntity>> {
    
    @ForeignKey(() => SalidaBienConsumoEntity)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => EntradaBienConsumoEntity)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'entrada_bien_consumo_id'
    })
    declare entradaBienConsumoId: number;
    

    @BelongsTo(() => SalidaBienConsumoEntity)
    declare salidaBienConsumoEntity?: SalidaBienConsumoEntity;
    
    @BelongsTo(() => EntradaBienConsumoEntity)
    declare entradaBienConsumoEntity?: EntradaBienConsumoEntity;
}