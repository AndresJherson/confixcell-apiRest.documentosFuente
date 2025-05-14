import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'nv_prioridad' })
export class NvPrioridadEntity extends Model<NvPrioridadEntity, Partial<NvPrioridadEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}