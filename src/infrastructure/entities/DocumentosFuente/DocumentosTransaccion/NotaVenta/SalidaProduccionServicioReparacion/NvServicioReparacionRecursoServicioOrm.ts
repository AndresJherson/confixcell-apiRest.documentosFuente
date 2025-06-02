import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NvServicioReparacionOrm } from './NvServicioReparacionOrm';
import { NvCategoriaReparacionOrm } from './NvCategoriaReparacionOrm';

@Table({ tableName: 'nv_servicio_reparacion_recurso_servicio' })
export class NvServicioReparacionRecursoServicioOrm extends Model<NvServicioReparacionRecursoServicioOrm, Partial<NvServicioReparacionRecursoServicioOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @ForeignKey(() => NvServicioReparacionOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_servicio_reparacion_id' })
    declare nvServicioReparacionId: number;

    @ForeignKey(() => NvCategoriaReparacionOrm)
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

    
    @BelongsTo(() => NvServicioReparacionOrm)
    declare nvServicioReparacionOrm?: NvServicioReparacionOrm;

    @BelongsTo(() => NvCategoriaReparacionOrm)
    declare nvCategoriaReparacionOrm?: NvCategoriaReparacionOrm;
}