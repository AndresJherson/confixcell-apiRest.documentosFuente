import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { SalidaBienConsumoValorEntradaOrm } from './SalidaBienConsumoValorEntradaOrm';
import { SalidaBienConsumoValorNuevoOrm } from './SalidaBienConsumoValorNuevoOrm';
import { EntradaBienConsumoValorSalidaOrm } from '../../Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaOrm';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { NvSalidaBienConsumoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoOrm';

@Table({ tableName: 'salida_bien_consumo' })
export class SalidaBienConsumoOrm extends Model<SalidaBienConsumoOrm, Partial<SalidaBienConsumoOrm>> {

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
    
    @ForeignKey(() => DocumentoFuenteOrm)
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
    

    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;
    

    @HasOne(() => SalidaBienConsumoValorNuevoOrm)
    declare salidaBienConsumoValorNuevoOrm?: SalidaBienConsumoValorNuevoOrm;

    @HasOne(() => SalidaBienConsumoValorEntradaOrm)
    declare salidaBienConsumoValorEntradaOrm?: SalidaBienConsumoValorEntradaOrm;

    @HasOne(() => NvSalidaBienConsumoOrm)
    declare nvSalidaBienConsumoOrm?: NvSalidaBienConsumoOrm;


    @HasMany(() => EntradaBienConsumoValorSalidaOrm)
    declare entradasBienConsumoValorSalidaOrm?: EntradaBienConsumoValorSalidaOrm[];
}