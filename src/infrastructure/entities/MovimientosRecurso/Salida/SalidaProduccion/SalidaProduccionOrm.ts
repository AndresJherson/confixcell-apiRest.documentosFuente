import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { SalidaProduccionServicioOrm } from './SalidaProduccionServicioOrm';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';

@Table({ tableName: 'salida_produccion' })
export class SalidaProduccionOrm extends Model<SalidaProduccionOrm, Partial<SalidaProduccionOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @ForeignKey(() => DocumentoFuenteOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'documento_fuente_id' })
    declare documentoFuenteId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, field: 'precio' })
    declare importePrecioNeto: number;


    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;

    @HasOne(() => SalidaProduccionServicioOrm)
    declare salidaProduccionServicioOrm?: SalidaProduccionServicioOrm;
}