import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { SalidaBienConsumoValorEntradaOrm } from '../../Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaOrm';
import { EntradaBienConsumoValorNuevoOrm } from './EntradaBienConsumoValorNuevoOrm';
import { EntradaBienConsumoValorSalidaOrm } from './EntradaBienConsumoValorSalidaOrm';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';

@Table({ tableName: 'entrada_bien_consumo' })
export class EntradaBienConsumoOrm extends Model<EntradaBienConsumoOrm, Partial<EntradaBienConsumoOrm>> {
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
    declare cantidadEntrante: number;
    

    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;


    @HasOne(() => EntradaBienConsumoValorNuevoOrm)
    declare entradaBienConsumoValorNuevoOrm?: EntradaBienConsumoValorNuevoOrm;

    @HasOne(() => EntradaBienConsumoValorSalidaOrm)
    declare entradaBienConsumoValorSalidaOrm?: EntradaBienConsumoValorSalidaOrm;

    
    @HasMany(() => SalidaBienConsumoValorEntradaOrm)
    declare salidasBienConsumoOrm?: SalidaBienConsumoValorEntradaOrm[];
}