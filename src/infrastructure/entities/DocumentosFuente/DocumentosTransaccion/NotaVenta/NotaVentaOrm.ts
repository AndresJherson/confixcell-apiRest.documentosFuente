import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DocumentoTransaccionOrm } from '../DocumentoTransaccionOrm';
import { NvEstadoOrm } from './NvEstadoOrm';
import { NvPrioridadOrm } from './NvPrioridadOrm';
import { NvSalidaBienConsumoOrm } from './SalidaBienConsumo/NvSalidaBienConsumoOrm';
import { NvServicioReparacionOrm } from './SalidaProduccionServicioReparacion/NvServicioReparacionOrm';
import { NvEntradaEfectivoOrm } from './EntradaEfectivo/NvEntradaEfectivoOrm';

@Table({ tableName: 'nota_venta' })
export class NotaVentaOrm extends Model<NotaVentaOrm, Partial<NotaVentaOrm>> 
{
    @ForeignKey(() => DocumentoTransaccionOrm)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.DATE, field: 'f_compromiso' })
    declare fechaCompromiso?: string;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'cliente_uuid' })
    declare clienteUuid: string;

    @ForeignKey(() => NvPrioridadOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_prioridad_id' })
    declare nvPrioridadId: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'usuario_tecnico_uuid' })
    declare usuarioTecnicoUuid: string;

    @ForeignKey(() => NvEstadoOrm)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_estado_id' })
    declare nvEstadoId: number;


    @BelongsTo(() => DocumentoTransaccionOrm)
    declare documentoTransaccionOrm?: DocumentoTransaccionOrm;

    @BelongsTo(() => NvPrioridadOrm)
    declare nvPrioridadOrm?: NvPrioridadOrm;

    @BelongsTo(() => NvEstadoOrm)
    declare nvEstadoOrm?: NvEstadoOrm;

    @HasMany(() => NvSalidaBienConsumoOrm)
    declare nvSalidasBienConsumoOrm?: NvSalidaBienConsumoOrm[];

    @HasMany(() => NvServicioReparacionOrm)
    declare nvServiciosReparacionOrm?: NvServicioReparacionOrm[];

    @HasMany(() => NvEntradaEfectivoOrm)
    declare nvEntradasEfectivoOrm?: NvEntradaEfectivoOrm[];
}