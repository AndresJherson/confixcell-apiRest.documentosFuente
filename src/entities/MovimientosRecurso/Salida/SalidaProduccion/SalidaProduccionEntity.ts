import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { SalidaProduccionServicioEntity } from './SalidaProduccionServicioEntity';

@Table({ tableName: 'salida_produccion' })
export class SalidaProduccionEntity extends Model<SalidaProduccionEntity, Partial<SalidaProduccionEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => DocumentoFuenteEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'documento_fuente_id' })
    declare documentoFuenteId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, field: 'precio' })
    declare importePrecioNeto: number;


    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;

    @HasOne(() => SalidaProduccionServicioEntity)
    declare salidaProduccionServicioEntity?: SalidaProduccionServicioEntity;
}