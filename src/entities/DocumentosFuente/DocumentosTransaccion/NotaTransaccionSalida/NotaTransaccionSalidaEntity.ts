import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { LiquidacionTipoEntity } from '../LiquidactionTipoEntity';
import { DocumentoTransaccionEntity } from '../DocumentoTransaccionEntity';
import { NtsDetalleEntity } from './NtsDetalleEntity';
import { NtsCreditoEntity } from './NtsCreditoEntity';

@Table({ tableName: 'nota_transaccion_salida' })
export class NotaTransaccionSalidaEntity extends Model<NotaTransaccionSalidaEntity, Partial<NotaTransaccionSalidaEntity>> 
{
    @ForeignKey(() => DocumentoTransaccionEntity)
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

    @ForeignKey(() => LiquidacionTipoEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'liquidacion_tipo_id' })
    declare liquidacionTipoId: number;


    @BelongsTo(() => DocumentoTransaccionEntity)
    declare documentoTransaccionEntity?: DocumentoTransaccionEntity;

    @BelongsTo(() => LiquidacionTipoEntity)
    declare liquidacionTipoEntity?: LiquidacionTipoEntity;

    @HasMany(() => NtsDetalleEntity)
    declare ntsDetallesEntity?: NtsDetalleEntity[];

    @HasOne(() => NtsCreditoEntity)
    declare ntsCreditoEntity?: NtsCreditoEntity;
}