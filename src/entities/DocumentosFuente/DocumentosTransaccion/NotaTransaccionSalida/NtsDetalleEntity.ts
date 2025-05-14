import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NotaTransaccionSalidaEntity } from './NotaTransaccionSalidaEntity';

@Table({ tableName: 'nts_detalle' })
export class NtsDetalleEntity extends Model<NtsDetalleEntity, Partial<NtsDetalleEntity>> 
{
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaTransaccionSalidaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_transaccion_salida_id' })
    declare notaTransaccionSalidaId: number;

    @Column({ type: DataType.STRING(50), field: 'recurso_uuid' })
    declare recursoUuid?: string;

    @Column({ type: DataType.STRING(200) })
    declare concepto?: string;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'precio_uni' })
    declare importeUnitario: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'cant' })
    declare cantidad: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'descuento' })
    declare importeDescuento: number;

    @Column({ type: DataType.STRING(200) })
    declare comentario?: string;


    @BelongsTo(() => NotaTransaccionSalidaEntity)
    declare notaTransaccionSalidaEntity?: NotaTransaccionSalidaEntity;
}