import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'medio_transferencia' })
export class MedioTransferenciaEntity extends Model<MedioTransferenciaEntity, Partial<MedioTransferenciaEntity>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true
    })
    declare nombre: string;
}