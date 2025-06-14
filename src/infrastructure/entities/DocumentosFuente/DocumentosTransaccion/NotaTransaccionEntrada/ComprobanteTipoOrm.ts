import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'comprobante_tipo' })
export class ComprobanteTipoOrm extends Model<ComprobanteTipoOrm, Partial<ComprobanteTipoOrm>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}