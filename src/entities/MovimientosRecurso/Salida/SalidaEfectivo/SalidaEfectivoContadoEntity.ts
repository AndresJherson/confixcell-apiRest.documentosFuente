import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaEfectivoEntity } from './SalidaEfectivoEntity';
import { MedioTransferenciaEntity } from '../../MedioTransferenciaEntity';

@Table({ tableName: 'salida_efectivo_contado' })
export class SalidaEfectivoContadoEntity extends Model<SalidaEfectivoContadoEntity, Partial<SalidaEfectivoContadoEntity>> {
    
    @ForeignKey(() => SalidaEfectivoEntity)
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
    

    @BelongsTo(() => SalidaEfectivoEntity)
    declare salidaEfectivoEntity?: SalidaEfectivoEntity;
    
    @BelongsTo(() => MedioTransferenciaEntity)
    declare medioTransferenciaEntity?: MedioTransferenciaEntity;
}