import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'comprobante_tipo' })
export class ComprobanteTipoEntity extends Model<ComprobanteTipoEntity, Partial<ComprobanteTipoEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string;
}