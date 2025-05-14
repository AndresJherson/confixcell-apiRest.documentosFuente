import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaBienConsumoEntity } from './EntradaBienConsumoEntity';
import { SalidaBienConsumoEntity } from '../../Salida/SalidaBienConsumo/SalidaBienConsumoEntity';

@Table({ tableName: 'entrada_bien_consumo_valor_salida' })
export class EntradaBienConsumoValorSalidaEntity extends Model<EntradaBienConsumoValorSalidaEntity, Partial<EntradaBienConsumoValorSalidaEntity>> {
    @ForeignKey(() => EntradaBienConsumoEntity)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => SalidaBienConsumoEntity)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'salida_bien_consumo_id'
    })
    declare salidaBienConsumoId: number;
    

    @BelongsTo(() => EntradaBienConsumoEntity)
    declare entradaBienConsumoEntity?: EntradaBienConsumoEntity;
    
    @BelongsTo(() => SalidaBienConsumoEntity)
    declare salidaBienConsumoEntity?: SalidaBienConsumoEntity;
}