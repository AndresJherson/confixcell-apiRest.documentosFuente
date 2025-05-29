import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NotaVentaOrm } from '../NotaVentaOrm';
import { EntradaEfectivoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoOrm';
import { MedioTransferenciaOrm } from 'src/infrastructure/entities/MovimientosRecurso/MedioTransferenciaOrm';

@Table({ tableName: 'nv_entrada_efectivo' })
export class NvEntradaEfectivoOrm extends Model<NvEntradaEfectivoOrm, Partial<NvEntradaEfectivoOrm>> 
{
    @ForeignKey(() => EntradaEfectivoOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @ForeignKey(() => NotaVentaOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nota_venta_id' })
    declare notaVentaId: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare numero: number;

    @Column({ type: DataType.DATE, allowNull: false })
    declare fecha: string;

    @ForeignKey(() => MedioTransferenciaOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'medio_transferencia_id' })
    declare medioTransferenciaId: number;


    @BelongsTo(() => EntradaEfectivoOrm)
    declare entradaEfectivoOrm?: EntradaEfectivoOrm;

    @BelongsTo(() => NotaVentaOrm)
    declare notaVentaOrm?: NotaVentaOrm;

    @BelongsTo(() => MedioTransferenciaOrm)
    declare medioTransferenciaOrm?: MedioTransferenciaOrm;
}