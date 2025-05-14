import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nv_estado' })
export class NvEstadoEntity extends Model<NvEstadoEntity, Partial<NvEstadoEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}