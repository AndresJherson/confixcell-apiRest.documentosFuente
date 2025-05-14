import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaVentaEntity } from '../NotaVentaEntity';
import { SalidaProduccionServicioEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioEntity';
import { NvServicioReparacionRecursoBienConsumoEntity } from './NvServicioReparacionRecursoBienConsumoEntity';
import { NvServicioReparacionRecursoServicioEntity } from './NvServicioReparacionRecursoServicioEntity';

@Table({ tableName: 'nv_servicio_reparacion' })
export class NvServicioReparacionEntity extends Model<NvServicioReparacionEntity, Partial<NvServicioReparacionEntity>> 
{
    @ForeignKey(() => SalidaProduccionServicioEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_venta_id' })
    declare notaVentaId: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'pantalla_modelo_uuid' })
    declare pantallaModeloUuid: string;

    @Column({ type: DataType.STRING(100) })
    declare imei?: string;

    @Column({ type: DataType.INTEGER })
    declare patron?: number;

    @Column({ type: DataType.STRING(50) })
    declare contrasena?: string;

    @Column({ type: DataType.STRING(500) })
    declare problema?: string;


    @BelongsTo(() => SalidaProduccionServicioEntity)
    declare salidaProduccionServicioEntity?: SalidaProduccionServicioEntity;

    @BelongsTo(() => NotaVentaEntity)
    declare notaVentaEntity?: NotaVentaEntity;
    
    @HasMany(() => NvServicioReparacionRecursoBienConsumoEntity)
    declare nvServicioReparacionRecursosBienConsumoEntity?: NvServicioReparacionRecursoBienConsumoEntity[];
    
    @HasMany(() => NvServicioReparacionRecursoServicioEntity)
    declare nvServicioReparacionRecursosServicioEntity?: NvServicioReparacionRecursoServicioEntity[];
}