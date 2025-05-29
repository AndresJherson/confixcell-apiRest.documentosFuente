import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { LiquidacionTipoOrm } from '../LiquidactionTipoOrm';
import { DocumentoTransaccionOrm } from '../DocumentoTransaccionOrm';
import { NtsDetalleOrm } from './NtsDetalleOrm';
import { NtsCreditoOrm } from './NtsCreditoOrm';

@Table({ tableName: 'nota_transaccion_salida' })
export class NotaTransaccionSalidaOrm extends Model<NotaTransaccionSalidaOrm, Partial<NotaTransaccionSalidaOrm>> 
{
    @ForeignKey(() => DocumentoTransaccionOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.STRING(50), field: 'cliente_uuid' })
    declare clienteUuid?: string;

    @Column({ type: DataType.STRING(50), field: 'cliente_documento_identificacion_uuid' })
    declare clienteDocumentoIdentificacionUuid?: string;

    @Column({ type: DataType.STRING(50), field: 'cliente_cod' })
    declare clienteCodigo?: string;

    @Column({ type: DataType.STRING(100), field: 'cliente_nombre' })
    declare clienteNombre?: string;

    @Column({ type: DataType.BIGINT, field: 'cliente_celular' })
    declare clienteCelular?: number;

    @ForeignKey(() => LiquidacionTipoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'liquidacion_tipo_id' })
    declare liquidacionTipoId: number;


    @BelongsTo(() => DocumentoTransaccionOrm)
    declare documentoTransaccionOrm?: DocumentoTransaccionOrm;

    @BelongsTo(() => LiquidacionTipoOrm)
    declare liquidacionTipoOrm?: LiquidacionTipoOrm;

    @HasMany(() => NtsDetalleOrm)
    declare ntsDetallesOrm?: NtsDetalleOrm[];

    @HasOne(() => NtsCreditoOrm)
    declare ntsCreditoOrm?: NtsCreditoOrm;
}