import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaEfectivoOrm } from './EntradaEfectivoOrm';
import { MedioTransferenciaOrm } from '../../MedioTransferenciaOrm';

@Table({ tableName: 'entrada_efectivo_contado' })
export class EntradaEfectivoContadoOrm extends Model<EntradaEfectivoContadoOrm, Partial<EntradaEfectivoContadoOrm>> {
    @ForeignKey(() => EntradaEfectivoOrm)
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

    
    @BelongsTo(() => EntradaEfectivoOrm)
    declare entradaEfectivoOrm?: EntradaEfectivoOrm;
    
    @BelongsTo(() => MedioTransferenciaOrm)
    declare medioTransferenciaOrm?: MedioTransferenciaOrm;
}