import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, HasOne } from 'sequelize-typescript';
import { DocumentoMovimientoEntity } from '../DocumentosMovimiento/DocumentoMovimientoEntity';
import { DocumentoFuenteEntity } from '../DocumentoFuenteEntity';
import { NotaTransaccionEntradaEntity } from './NotaTransaccionEntrada/NotaTransaccionEntradaEntity';
import { NotaTransaccionSalidaEntity } from './NotaTransaccionSalida/NotaTransaccionSalidaEntity';
import { NotaVentaEntity } from './NotaVenta/NotaVentaEntity';

@Table({ tableName: 'documento_transaccion' })
export class DocumentoTransaccionEntity extends Model<DocumentoTransaccionEntity, Partial<DocumentoTransaccionEntity>> {

    @ForeignKey(() => DocumentoFuenteEntity)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;


    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;
    
    @HasMany(() => DocumentoMovimientoEntity)
    declare documentosMovimientoEntity?: DocumentoMovimientoEntity[];


    @HasOne(() => NotaTransaccionEntradaEntity)
    declare notaTransaccionEntradaEntity?: NotaTransaccionEntradaEntity;

    @HasOne(() => NotaTransaccionSalidaEntity)
    declare notaTransaccionSalidaEntity?: NotaTransaccionSalidaEntity;

    @HasOne(() => NotaVentaEntity)
    declare notaVentaEntity?: NotaVentaEntity;
}