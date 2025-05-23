import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NvServicioReparacionEntity } from './NvServicioReparacionEntity';
import { NvCategoriaReparacionEntity } from './NvCategoriaReparacionEntity';

@Table({ tableName: 'nv_servicio_reparacion_recurso_servicio' })
export class NvServicioReparacionRecursoServicioEntity extends Model<NvServicioReparacionRecursoServicioEntity, Partial<NvServicioReparacionRecursoServicioEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @ForeignKey(() => NvServicioReparacionEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_servicio_reparacion_id' })
    declare nvServicioReparacionId: number;

    @ForeignKey(() => NvCategoriaReparacionEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_categoria_reparacion_id' })
    declare nvCategoriaReparacionId: number;

    @Column({ type: DataType.STRING(100) })
    declare descripcion?: string;

    @Column({ type: DataType.DATE, allowNull: false, field: 'f_inicio' })
    declare fechaInicio: string;

    @Column({ type: DataType.DATE, field: 'f_final' })
    declare fechaFinal?: string;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'precio' })
    declare importePrecio: number;

    
    @BelongsTo(() => NvServicioReparacionEntity)
    declare nvServicioReparacionEntity?: NvServicioReparacionEntity;

    @BelongsTo(() => NvCategoriaReparacionEntity)
    declare nvCategoriaReparacionEntity?: NvCategoriaReparacionEntity;
}