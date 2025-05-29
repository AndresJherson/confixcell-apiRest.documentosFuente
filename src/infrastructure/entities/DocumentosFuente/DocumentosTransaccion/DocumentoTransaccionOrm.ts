import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, HasOne } from 'sequelize-typescript';
import { DocumentoMovimientoOrm } from '../DocumentosMovimiento/DocumentoMovimientoOrm';
import { DocumentoFuenteOrm } from '../DocumentoFuenteOrm';
import { NotaTransaccionEntradaOrm } from './NotaTransaccionEntrada/NotaTransaccionEntradaOrm';
import { NotaTransaccionSalidaOrm } from './NotaTransaccionSalida/NotaTransaccionSalidaOrm';
import { NotaVentaOrm } from './NotaVenta/NotaVentaOrm';

@Table({ tableName: 'documento_transaccion' })
export class DocumentoTransaccionOrm extends Model<DocumentoTransaccionOrm, Partial<DocumentoTransaccionOrm>> {

    @ForeignKey(() => DocumentoFuenteOrm)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;


    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;
    
    @HasMany(() => DocumentoMovimientoOrm)
    declare documentosMovimientoOrm?: DocumentoMovimientoOrm[];


    @HasOne(() => NotaTransaccionEntradaOrm)
    declare notaTransaccionEntradaOrm?: NotaTransaccionEntradaOrm;

    @HasOne(() => NotaTransaccionSalidaOrm)
    declare notaTransaccionSalidaOrm?: NotaTransaccionSalidaOrm;

    @HasOne(() => NotaVentaOrm)
    declare notaVentaOrm?: NotaVentaOrm;
}