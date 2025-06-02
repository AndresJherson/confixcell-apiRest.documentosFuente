import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NvServicioReparacionOrm } from './NvServicioReparacionOrm';

@Table({ tableName: 'nv_servicio_reparacion_recurso_bien_consumo' })
export class NvServicioReparacionRecursoBienConsumoOrm extends Model<NvServicioReparacionRecursoBienConsumoOrm, Partial<NvServicioReparacionRecursoBienConsumoOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @ForeignKey(() => NvServicioReparacionOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_servicio_reparacion_id' })
    declare nvServicioReparacionId: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'almacen_uuid' })
    declare almacenUuid: string;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'bien_consumo_uuid' })
    declare bienConsumoUuid: string;

    @Column({ type: DataType.DATE, allowNull: false })
    declare fecha: string;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'cant' })
    declare cantidad: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'precio_uni' })
    declare importePrecioUnitario: number;


    @BelongsTo(() => NvServicioReparacionOrm)
    declare nvServicioReparacionOrm?: NvServicioReparacionOrm;
}