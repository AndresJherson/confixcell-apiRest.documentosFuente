import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { SalidaProduccionOrm } from './SalidaProduccionOrm';
import { NvServicioReparacionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionOrm';

@Table({ tableName: 'salida_produccion_servicio' })
export class SalidaProduccionServicioOrm extends Model<SalidaProduccionServicioOrm, Partial<SalidaProduccionServicioOrm>> 
{
    @ForeignKey(() => SalidaProduccionOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'servicio_uuid' })
    declare servicioUuid: string;

    
    @BelongsTo(() => SalidaProduccionOrm)
    declare salidaProduccionOrm?: SalidaProduccionOrm;

    @HasOne(() => NvServicioReparacionOrm)
    declare nvServicioReparacionOrm?: NvServicioReparacionOrm;
}