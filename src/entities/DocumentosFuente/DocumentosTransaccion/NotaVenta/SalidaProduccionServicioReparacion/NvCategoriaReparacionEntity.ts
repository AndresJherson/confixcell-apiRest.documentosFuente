import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nv_categoria_reparacion' })
export class NvCategoriaReparacionEntity extends Model<NvCategoriaReparacionEntity, Partial<NvCategoriaReparacionEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}