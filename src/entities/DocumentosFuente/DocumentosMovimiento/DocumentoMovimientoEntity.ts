import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentoTransaccionEntity } from '../DocumentosTransaccion/DocumentoTransaccionEntity';
import { DocumentoFuenteEntity } from '../DocumentoFuenteEntity';

@Table({ tableName: 'documento_movimiento' })
export class DocumentoMovimientoEntity extends Model<DocumentoMovimientoEntity, Partial<DocumentoMovimientoEntity>> {

    @ForeignKey(() => DocumentoFuenteEntity)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => DocumentoTransaccionEntity)
    @Column({
        type: DataType.INTEGER,
        field: 'documento_transaccion_id'
    })
    declare documentoTransaccionId?: number;


    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;
    
    @BelongsTo(() => DocumentoTransaccionEntity)
    declare documentoTransaccionEntity?: DocumentoTransaccionEntity;
}