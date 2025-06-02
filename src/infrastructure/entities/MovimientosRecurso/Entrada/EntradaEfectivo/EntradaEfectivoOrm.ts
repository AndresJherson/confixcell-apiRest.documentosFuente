import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { EntradaEfectivoContadoOrm } from './EntradaEfectivoContadoOrm';
import { EntradaEfectivoCreditoOrm } from './EntradaEfectivoCreditoOrm';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { NteCreditoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoOrm';
import { NvEntradaEfectivoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoOrm';

@Table({ tableName: 'entrada_efectivo' })
export class EntradaEfectivoOrm extends Model<EntradaEfectivoOrm, Partial<EntradaEfectivoOrm>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    })
    declare id: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true
    })
    declare uuid: string;
    
    @ForeignKey(() => DocumentoFuenteOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'documento_fuente_id'
    })
    declare documentoFuenteId: number;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        field: 'valor'
    })
    declare importeValorNeto: number;
    

    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;

    @HasOne(() => EntradaEfectivoContadoOrm)
    declare entradaEfectivoContadoOrm?: EntradaEfectivoContadoOrm;

    @HasOne(() => EntradaEfectivoCreditoOrm)
    declare entradaEfectivoCreditoOrm?: EntradaEfectivoCreditoOrm;

    @HasOne(() => NteCreditoOrm)
    declare nteCreditoOrm?: NteCreditoOrm;

    @HasOne(() => NvEntradaEfectivoOrm)
    declare nvEntradaEfectivoOrm?: NvEntradaEfectivoOrm;
}