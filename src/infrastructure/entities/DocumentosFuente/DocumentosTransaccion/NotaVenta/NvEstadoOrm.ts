import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nv_estado' })
export class NvEstadoOrm extends Model<NvEstadoOrm, Partial<NvEstadoOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}