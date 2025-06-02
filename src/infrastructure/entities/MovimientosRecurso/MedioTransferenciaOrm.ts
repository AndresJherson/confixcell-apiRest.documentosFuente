import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'medio_transferencia' })
export class MedioTransferenciaOrm extends Model<MedioTransferenciaOrm, Partial<MedioTransferenciaOrm>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;
    
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true
    })
    declare nombre: string;
}