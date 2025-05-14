import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DocumentoTransaccionEntity } from '../DocumentoTransaccionEntity';
import { NvEstadoEntity } from './NvEstadoEntity';
import { NvPrioridadEntity } from './NvPrioridadEntity';
import { NvSalidaBienConsumoEntity } from './SalidaBienConsumo/NvSalidaBienConsumoEntity';
import { NvServicioReparacionEntity } from './SalidaProduccionServicioReparacion/NvServicioReparacionEntity';
import { NvEntradaEfectivoEntity } from './EntradaEfectivo/NvEntradaEfectivoEntity';

@Table({ tableName: 'nota_venta' })
export class NotaVentaEntity extends Model<NotaVentaEntity, Partial<NotaVentaEntity>> 
{
    @ForeignKey(() => DocumentoTransaccionEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    declare id: number;

    @Column({ type: DataType.DATE, field: 'f_compromiso' })
    declare fechaCompromiso?: string;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'cliente_uuid' })
    declare clienteUuid: string;

    @ForeignKey(() => NvPrioridadEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_prioridad_id' })
    declare nvPrioridadId: number;

    @Column({ type: DataType.STRING(50), allowNull: false, field: 'usuario_tecnico_uuid' })
    declare usuarioTecnicoUuid: string;

    @ForeignKey(() => NvEstadoEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'nv_estado_id' })
    declare nvEstadoId: number;


    @BelongsTo(() => DocumentoTransaccionEntity)
    declare documentoTransaccionEntity?: DocumentoTransaccionEntity;

    @BelongsTo(() => NvPrioridadEntity)
    declare nvPrioridadEntity?: NvPrioridadEntity;

    @BelongsTo(() => NvEstadoEntity)
    declare nvEstadoEntity?: NvEstadoEntity;

    @HasMany(() => NvSalidaBienConsumoEntity)
    declare nvSalidasBienConsumoEntity?: NvSalidaBienConsumoEntity[];

    @HasMany(() => NvServicioReparacionEntity)
    declare nvServiciosReparacionEntity?: NvServicioReparacionEntity[];

    @HasMany(() => NvEntradaEfectivoEntity)
    declare nvEntradasEfectivoEntity?: NvEntradaEfectivoEntity[];
}