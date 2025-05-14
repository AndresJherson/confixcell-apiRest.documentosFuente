import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { SalidaProduccionEntity } from './SalidaProduccionEntity';
import { NvServicioReparacionEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionEntity';

@Table({ tableName: 'salida_produccion_servicio' })
export class SalidaProduccionServicioEntity extends Model<SalidaProduccionServicioEntity, Partial<SalidaProduccionServicioEntity>> 
{
    @ForeignKey(() => SalidaProduccionEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'servicio_uuid' })
    declare servicioUuid: string;

    
    @BelongsTo(() => SalidaProduccionEntity)
    declare salidaProduccionEntity?: SalidaProduccionEntity;

    @HasOne(() => NvServicioReparacionEntity)
    declare nvServicioReparacionEntity?: NvServicioReparacionEntity;
}