import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { SalidaEfectivoContadoEntity } from './SalidaEfectivoContadoEntity';
import { SalidaEfectivoCreditoEntity } from './SalidaEfectivoCreditoEntity';
import { NtsCreditoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoEntity';

@Table({ tableName: 'salida_efectivo' })
export class SalidaEfectivoEntity extends Model<SalidaEfectivoEntity, Partial<SalidaEfectivoEntity>> {
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
        defaultValue: 0,
        field: 'valor'
    })
    declare importeValorNeto: number;
    

    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;

    @HasOne(() => SalidaEfectivoContadoEntity)
    declare salidaEfectivoContadoEntity?: SalidaEfectivoContadoEntity;

    @HasOne(() => SalidaEfectivoCreditoEntity)
    declare salidaEfectivoCreditoEntity?: SalidaEfectivoCreditoEntity;

    @HasOne(() => NtsCreditoEntity)
    declare ntsCreditoEntity?: NtsCreditoEntity;
}