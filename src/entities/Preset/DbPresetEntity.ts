import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'db_preset' })
export class DbPresetEntity extends Model<DbPresetEntity, Partial<DbPresetEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(100), allowNull: false })
    declare titulo: string;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare target: string;

    @Column({ type: DataType.STRING(100) })
    declare valor: string;
}