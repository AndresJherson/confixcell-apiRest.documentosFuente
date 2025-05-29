import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'liquidacion_tipo' })
export class LiquidacionTipoOrm extends Model<LiquidacionTipoOrm, Partial<LiquidacionTipoOrm>> {
    
    @Column({ 
        type: DataType.INTEGER, 
        primaryKey: true 
    })
    declare id: number;

    @Column({ 
        type: DataType.STRING(100), 
        allowNull: false, 
        unique: true 
    })
    declare nombre: string;
}