import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentoTransaccionOrm } from '../DocumentosTransaccion/DocumentoTransaccionOrm';
import { DocumentoFuenteOrm } from '../DocumentoFuenteOrm';

@Table({ tableName: 'documento_movimiento' })
export class DocumentoMovimientoOrm extends Model<DocumentoMovimientoOrm, Partial<DocumentoMovimientoOrm>> {

    @ForeignKey(() => DocumentoFuenteOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => DocumentoTransaccionOrm)
    @Column({
        type: DataType.INTEGER,
        field: 'documento_transaccion_id'
    })
    declare documentoTransaccionId?: number;


    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;
    
    @BelongsTo(() => DocumentoTransaccionOrm)
    declare documentoTransaccionOrm?: DocumentoTransaccionOrm;
}