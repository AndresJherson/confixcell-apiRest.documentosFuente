import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaEfectivoEntity } from './EntradaEfectivoEntity';
import { MedioTransferenciaEntity } from '../../MedioTransferenciaEntity';

@Table({ tableName: 'entrada_efectivo_contado' })
export class EntradaEfectivoContadoEntity extends Model<EntradaEfectivoContadoEntity, Partial<EntradaEfectivoContadoEntity>> {
    @ForeignKey(() => EntradaEfectivoEntity)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => MedioTransferenciaEntity)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'medio_transferencia_id'
    })
    declare medioTransferenciaId: number;

    
    @BelongsTo(() => EntradaEfectivoEntity)
    declare entradaEfectivoEntity?: EntradaEfectivoEntity;
    
    @BelongsTo(() => MedioTransferenciaEntity)
    declare medioTransferenciaEntity?: MedioTransferenciaEntity;
}