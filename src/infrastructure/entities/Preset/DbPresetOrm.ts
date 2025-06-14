import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'db_preset' })
export class DbPresetOrm extends Model<DbPresetOrm, Partial<DbPresetOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @Column({ type: DataType.STRING(100), allowNull: false })
    declare titulo: string;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare target: string;

    @Column({ type: DataType.STRING(100) })
    declare valor: string;
}