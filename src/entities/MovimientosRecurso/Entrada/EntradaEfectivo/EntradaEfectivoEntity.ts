import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { EntradaEfectivoContadoEntity } from './EntradaEfectivoContadoEntity';
import { EntradaEfectivoCreditoEntity } from './EntradaEfectivoCreditoEntity';
import { NteCreditoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoEntity';
import { NvEntradaEfectivoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoEntity';

@Table({ tableName: 'entrada_efectivo' })
export class EntradaEfectivoEntity extends Model<EntradaEfectivoEntity, Partial<EntradaEfectivoEntity>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @ForeignKey(() => DocumentoFuenteEntity)
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
    

    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;

    @HasOne(() => EntradaEfectivoContadoEntity)
    declare entradaEfectivoContadoEntity?: EntradaEfectivoContadoEntity;

    @HasOne(() => EntradaEfectivoCreditoEntity)
    declare entradaEfectivoCreditoEntity?: EntradaEfectivoCreditoEntity;

    @HasOne(() => NteCreditoEntity)
    declare nteCreditoEntity?: NteCreditoEntity;

    @HasOne(() => NvEntradaEfectivoEntity)
    declare nvEntradaEfectivoEntity?: NvEntradaEfectivoEntity;
}