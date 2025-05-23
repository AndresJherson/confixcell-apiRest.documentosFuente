import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { SalidaBienConsumoValorEntradaEntity } from './SalidaBienConsumoValorEntradaEntity';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { SalidaBienConsumoValorNuevoEntity } from './SalidaBienConsumoValorNuevoEntity';
import { EntradaBienConsumoValorSalidaEntity } from '../../Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaEntity';
import { NvSalidaBienConsumoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoEntity';

@Table({ tableName: 'salida_bien_consumo' })
export class SalidaBienConsumoEntity extends Model<SalidaBienConsumoEntity, Partial<SalidaBienConsumoEntity>> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true
    })
    declare uuid: string;
    
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
    declare cantidadSaliente: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'precio_uni'
    })
    declare importePrecioUnitario: number;
    

    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;
    

    @HasOne(() => SalidaBienConsumoValorNuevoEntity)
    declare salidaBienConsumoValorNuevoEntity?: SalidaBienConsumoValorNuevoEntity;

    @HasOne(() => SalidaBienConsumoValorEntradaEntity)
    declare salidaBienConsumoValorEntradaEntity?: SalidaBienConsumoValorEntradaEntity;

    @HasOne(() => NvSalidaBienConsumoEntity)
    declare nvSalidaBienConsumoEntity?: NvSalidaBienConsumoEntity;


    @HasMany(() => EntradaBienConsumoValorSalidaEntity)
    declare entradasBienConsumoValorSalidaEntity?: EntradaBienConsumoValorSalidaEntity[];
}