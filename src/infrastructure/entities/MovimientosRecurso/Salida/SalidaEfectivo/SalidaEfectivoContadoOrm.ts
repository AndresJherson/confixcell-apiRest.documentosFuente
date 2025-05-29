import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaEfectivoOrm } from './SalidaEfectivoOrm';
import { MedioTransferenciaOrm } from '../../MedioTransferenciaOrm';

@Table({ tableName: 'salida_efectivo_contado' })
export class SalidaEfectivoContadoOrm extends Model<SalidaEfectivoContadoOrm, Partial<SalidaEfectivoContadoOrm>> {
    
    @ForeignKey(() => SalidaEfectivoOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => MedioTransferenciaOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'medio_transferencia_id'
    })
    declare medioTransferenciaId: number;
    

    @BelongsTo(() => SalidaEfectivoOrm)
    declare salidaEfectivoOrm?: SalidaEfectivoOrm;
    
    @BelongsTo(() => MedioTransferenciaOrm)
    declare medioTransferenciaOrm?: MedioTransferenciaOrm;
}