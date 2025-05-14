import { Table, Column, Model, DataType, HasMany, HasOne } from 'sequelize-typescript';
import { NotaEntity } from './Nota/NotaEntity';
import { EntradaEfectivoEntity } from '../MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoEntity';
import { EntradaBienConsumoEntity } from '../MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoEntity';
import { SalidaEfectivoEntity } from '../MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoEntity';
import { SalidaBienConsumoEntity } from '../MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoEntity';
import { DocumentoTransaccionEntity } from './DocumentosTransaccion/DocumentoTransaccionEntity';
import { DocumentoMovimientoEntity } from './DocumentosMovimiento/DocumentoMovimientoEntity';

@Table({
    tableName: 'documento_fuente',
    indexes: [
        {
            unique: true,
            fields: [ 'cod_serie', 'cod_numero' ]
        }
    ]
})
export class DocumentoFuenteEntity extends Model<DocumentoFuenteEntity, Partial<DocumentoFuenteEntity>> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    declare id: number;
    
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true
    })
    declare uuid: string;
    
    @Column({
        type: DataType.STRING(50),
        field: 'cod_serie'
    })
    declare codigoSerie?: string;
    
    @Column({
        type: DataType.INTEGER,
        field: 'cod_numero'
    })
    declare codigoNumero?: number;
    
    @Column({
        type: DataType.DATE,
        field: 'f_emision'
    })
    declare fechaEmision?: string;
    
    @Column({
        type: DataType.DATE,
        field: 'f_anulacion'
    })
    declare fechaAnulacion?: string;

    @Column({
        type: DataType.STRING(100),
    })
    declare concepto?: string;
    
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'importe_neto'
    })
    declare importeNeto: number;
    
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'usuario_uuid'
    })
    declare usuarioUuid: string;

    @Column({
        type: DataType.DATE,
        field: 'f_creacion',
        allowNull: false,
    })
    declare fechaCreacion: string;
    
    @Column({
        type: DataType.DATE,
        field: 'f_actualizacion',
        allowNull: false
    })
    declare fechaActualizacion: string;
    
    
    @HasMany(() => NotaEntity)
    declare notasEntity?: NotaEntity[];


    @HasMany(() => EntradaEfectivoEntity)
    declare entradasEfectivoEntity?: EntradaEfectivoEntity[];

    @HasMany(() => EntradaBienConsumoEntity)
    declare entradasBienConsumoEntity?: EntradaBienConsumoEntity[];


    @HasMany(() => SalidaEfectivoEntity)
    declare salidasEfectivoEntity?: SalidaEfectivoEntity[];

    @HasMany(() => SalidaBienConsumoEntity)
    declare salidasBienConsumoEntity?: SalidaBienConsumoEntity[];


    @HasOne(() => DocumentoTransaccionEntity)
    declare documentoTransaccionEntity?: DocumentoTransaccionEntity;

    @HasOne(() => DocumentoMovimientoEntity)
    declare documentoMovimientoEntity?: DocumentoMovimientoEntity;
}