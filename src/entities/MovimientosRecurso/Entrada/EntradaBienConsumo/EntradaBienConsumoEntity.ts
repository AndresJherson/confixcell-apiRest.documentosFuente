import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { SalidaBienConsumoValorEntradaEntity } from '../../Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaEntity';
import { EntradaBienConsumoValorNuevoEntity } from './EntradaBienConsumoValorNuevoEntity';
import { EntradaBienConsumoValorSalidaEntity } from './EntradaBienConsumoValorSalidaEntity';

@Table({ tableName: 'entrada_bien_consumo' })
export class EntradaBienConsumoEntity extends Model<EntradaBienConsumoEntity, Partial<EntradaBienConsumoEntity>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => DocumentoFuenteEntity)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'documento_fuente_id'
    })
    declare documentoFuenteId: number;
    
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'almacen_uuid'
    })
    declare almacenUuid: string;
    
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'bien_consumo_uuid'
    })
    declare bienConsumoUuid: string;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'cant'
    })
    declare cantidad: number;
    

    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;


    @HasOne(() => EntradaBienConsumoValorNuevoEntity)
    declare entradaBienConsumoValorNuevoEntity?: EntradaBienConsumoValorNuevoEntity;

    @HasOne(() => EntradaBienConsumoValorSalidaEntity)
    declare entradaBienConsumoValorSalidaEntity?: EntradaBienConsumoValorSalidaEntity;

    
    @HasMany(() => SalidaBienConsumoValorEntradaEntity)
    declare salidasBienConsumoEntity?: SalidaBienConsumoValorEntradaEntity[];
}