import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NotaVentaOrm } from '../NotaVentaOrm';
import { NvServicioReparacionRecursoBienConsumoOrm } from './NvServicioReparacionRecursoBienConsumoOrm';
import { NvServicioReparacionRecursoServicioOrm } from './NvServicioReparacionRecursoServicioOrm';
import { SalidaProduccionServicioOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioOrm';

@Table({ tableName: 'nv_servicio_reparacion' })
export class NvServicioReparacionOrm extends Model<NvServicioReparacionOrm, Partial<NvServicioReparacionOrm>> 
{
    @ForeignKey(() => SalidaProduccionServicioOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaOrm)
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


    @BelongsTo(() => SalidaProduccionServicioOrm)
    declare salidaProduccionServicioOrm?: SalidaProduccionServicioOrm;

    @BelongsTo(() => NotaVentaOrm)
    declare notaVentaOrm?: NotaVentaOrm;
    
    @HasMany(() => NvServicioReparacionRecursoBienConsumoOrm)
    declare nvServicioReparacionRecursosBienConsumoOrm?: NvServicioReparacionRecursoBienConsumoOrm[];
    
    @HasMany(() => NvServicioReparacionRecursoServicioOrm)
    declare nvServicioReparacionRecursosServicioOrm?: NvServicioReparacionRecursoServicioOrm[];
}