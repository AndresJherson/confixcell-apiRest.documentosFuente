import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nv_prioridad' })
export class NvPrioridadOrm extends Model<NvPrioridadOrm, Partial<NvPrioridadOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}