import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { ComprobanteTipoOrm } from './ComprobanteTipoOrm';
import { LiquidacionTipoOrm } from '../LiquidactionTipoOrm';
import { DocumentoTransaccionOrm } from '../DocumentoTransaccionOrm';
import { NteDetalleOrm } from './NteDetalleOrm';
import { NteCreditoOrm } from './NteCreditoOrm';

@Table({ tableName: 'nota_transaccion_entrada' })
export class NotaTransaccionEntradaOrm extends Model<NotaTransaccionEntradaOrm, Partial<NotaTransaccionEntradaOrm>> 
{
    @ForeignKey(() => DocumentoTransaccionOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => ComprobanteTipoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'comprobante_tipo_id' })
    declare comprobanteTipoId: number;

    @Column({ type: DataType.STRING(50), field: 'comprobante_cod_serie' })
    declare comprobanteCodigoSerie?: string;

    @Column({ type: DataType.INTEGER, field: 'comprobante_cod_numero' })
    declare comprobanteCodigoNumero?: number;

    @Column({ type: DataType.STRING(50), field: 'proveedor_uuid' })
    declare proveedorUuid?: string;

    @Column({ type: DataType.STRING(50), field: 'proveedor_documento_identificacion_uuid' })
    declare proveedorDocumentoIdentificacionUuid?: string;

    @Column({ type: DataType.STRING(50), field: 'proveedor_cod' })
    declare proveedorCodigo?: string;

    @Column({ type: DataType.STRING(100), field: 'proveedor_nombre' })
    declare proveedorNombre?: string;

    @Column({ type: DataType.BIGINT, field: 'proveedor_celular' })
    declare proveedorCelular?: number;

    @ForeignKey(() => LiquidacionTipoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'liquidacion_tipo_id' })
    declare liquidacionTipoId: number;


    @BelongsTo(() => DocumentoTransaccionOrm)
    declare documentoTransaccionOrm?: DocumentoTransaccionOrm;

    @BelongsTo(() => ComprobanteTipoOrm)
    declare comprobanteTipoOrm?: ComprobanteTipoOrm;

    @BelongsTo(() => LiquidacionTipoOrm)
    declare liquidacionTipoOrm?: LiquidacionTipoOrm;

    @HasMany(() => NteDetalleOrm)
    declare nteDetallesOrm?: NteDetalleOrm[];

    @HasOne(() => NteCreditoOrm)
    declare nteCreditoOrm?: NteCreditoOrm;
}