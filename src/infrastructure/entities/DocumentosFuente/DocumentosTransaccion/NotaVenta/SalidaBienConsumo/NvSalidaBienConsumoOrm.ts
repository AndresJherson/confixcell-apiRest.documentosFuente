import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NotaVentaOrm } from '../NotaVentaOrm';
import { SalidaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';

@Table({ tableName: 'nv_salida_bien_consumo' })
export class NvSalidaBienConsumoOrm extends Model<NvSalidaBienConsumoOrm, Partial<NvSalidaBienConsumoOrm>> 
{
    @ForeignKey(() => SalidaBienConsumoOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_venta_id' })
    declare notaVentaId: number;

    @Column({ type: DataType.DECIMAL(20, 2), allowNull: false, defaultValue: 0, field: 'descuento' })
    declare importeDescuento: number;


    @BelongsTo(() => SalidaBienConsumoOrm)
    declare salidaBienConsumoOrm?: SalidaBienConsumoOrm;

    @BelongsTo(() => NotaVentaOrm)
    declare notaVentaOrm?: NotaVentaOrm;
}