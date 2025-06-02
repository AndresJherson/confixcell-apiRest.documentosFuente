import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { SalidaEfectivoContadoOrm } from './SalidaEfectivoContadoOrm';
import { SalidaEfectivoCreditoOrm } from './SalidaEfectivoCreditoOrm';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { NtsCreditoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoOrm';

@Table({ tableName: 'salida_efectivo' })
export class SalidaEfectivoOrm extends Model<SalidaEfectivoOrm, Partial<SalidaEfectivoOrm>> {
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
        defaultValue: 0,
        field: 'valor'
    })
    declare importeValorNeto: number;
    

    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;

    @HasOne(() => SalidaEfectivoContadoOrm)
    declare salidaEfectivoContadoOrm?: SalidaEfectivoContadoOrm;

    @HasOne(() => SalidaEfectivoCreditoOrm)
    declare salidaEfectivoCreditoOrm?: SalidaEfectivoCreditoOrm;

    @HasOne(() => NtsCreditoOrm)
    declare ntsCreditoOrm?: NtsCreditoOrm;
}