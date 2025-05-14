import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { ComprobanteTipoEntity } from './ComprobanteTipoEntity';
import { LiquidacionTipoEntity } from '../LiquidactionTipoEntity';
import { DocumentoTransaccionEntity } from '../DocumentoTransaccionEntity';
import { NteDetalleEntity } from './NteDetalleEntity';
import { NteCreditoEntity } from './NteCreditoEntity';

@Table({ tableName: 'nota_transaccion_entrada' })
export class NotaTransaccionEntradaEntity extends Model<NotaTransaccionEntradaEntity, Partial<NotaTransaccionEntradaEntity>> 
{
    @ForeignKey(() => DocumentoTransaccionEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => ComprobanteTipoEntity)
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

    @ForeignKey(() => LiquidacionTipoEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'liquidacion_tipo_id' })
    declare liquidacionTipoId: number;


    @BelongsTo(() => DocumentoTransaccionEntity)
    declare documentoTransaccionEntity?: DocumentoTransaccionEntity;

    @BelongsTo(() => ComprobanteTipoEntity)
    declare comprobanteTipoEntity?: ComprobanteTipoEntity;

    @BelongsTo(() => LiquidacionTipoEntity)
    declare liquidacionTipoEntity?: LiquidacionTipoEntity;

    @HasMany(() => NteDetalleEntity)
    declare nteDetallesEntity?: NteDetalleEntity[];

    @HasOne(() => NteCreditoEntity)
    declare nteCreditoEntity?: NteCreditoEntity;
}