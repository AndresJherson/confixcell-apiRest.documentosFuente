import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntradaEfectivoEntity } from 'src/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoEntity';
import { NotaVentaEntity } from '../NotaVentaEntity';
import { MedioTransferenciaEntity } from 'src/entities/MovimientosRecurso/MedioTransferenciaEntity';

@Table({ tableName: 'nv_entrada_efectivo' })
export class NvEntradaEfectivoEntity extends Model<NvEntradaEfectivoEntity, Partial<NvEntradaEfectivoEntity>> 
{
    @ForeignKey(() => EntradaEfectivoEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_venta_id' })
    declare notaVentaId: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare numero: number;

    @Column({ type: DataType.DATE, allowNull: false })
    declare fecha: string;

    @ForeignKey(() => MedioTransferenciaEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'medio_transferencia_id' })
    declare medioTransferenciaId: number;


    @BelongsTo(() => EntradaEfectivoEntity)
    declare entradaEfectivoEntity?: EntradaEfectivoEntity;

    @BelongsTo(() => NotaVentaEntity)
    declare notaVentaEntity?: NotaVentaEntity;

    @BelongsTo(() => MedioTransferenciaEntity)
    declare medioTransferenciaEntity?: MedioTransferenciaEntity;
}