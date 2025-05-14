import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SalidaBienConsumoEntity } from 'src/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoEntity';
import { NotaVentaEntity } from '../NotaVentaEntity';

@Table({ tableName: 'nv_salida_bien_consumo' })
export class NvSalidaBienConsumoEntity extends Model<NvSalidaBienConsumoEntity, Partial<NvSalidaBienConsumoEntity>> 
{
    @ForeignKey(() => SalidaBienConsumoEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_venta_id' })
    declare notaVentaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'descuento' })
    declare importeDescuento: number;


    @BelongsTo(() => SalidaBienConsumoEntity)
    declare salidaBienConsumoEntity?: SalidaBienConsumoEntity;

    @BelongsTo(() => NotaVentaEntity)
    declare notaVentaEntity?: NotaVentaEntity;
}