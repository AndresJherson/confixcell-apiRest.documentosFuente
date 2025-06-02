import { Table, Column, Model, DataType, HasMany, HasOne } from 'sequelize-typescript';
import { NotaOrm } from './Nota/NotaOrm';
import { EntradaEfectivoOrm } from '../MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoOrm';
import { EntradaBienConsumoOrm } from '../MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoOrm';
import { SalidaEfectivoOrm } from '../MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoOrm';
import { SalidaBienConsumoOrm } from '../MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';
import { DocumentoTransaccionOrm } from './DocumentosTransaccion/DocumentoTransaccionOrm';
import { DocumentoMovimientoOrm } from './DocumentosMovimiento/DocumentoMovimientoOrm';

@Table({
    tableName: 'documento_fuente',
    indexes: [
        {
            unique: true,
            fields: [ 'cod_serie', 'cod_numero' ]
        }
    ]
})
export class DocumentoFuenteOrm extends Model<DocumentoFuenteOrm, Partial<DocumentoFuenteOrm>> {
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
    
    
    @HasMany(() => NotaOrm)
    declare notasOrm?: NotaOrm[];


    @HasMany(() => EntradaEfectivoOrm)
    declare entradasEfectivoOrm?: EntradaEfectivoOrm[];

    @HasMany(() => EntradaBienConsumoOrm)
    declare entradasBienConsumoOrm?: EntradaBienConsumoOrm[];


    @HasMany(() => SalidaEfectivoOrm)
    declare salidasEfectivoOrm?: SalidaEfectivoOrm[];

    @HasMany(() => SalidaBienConsumoOrm)
    declare salidasBienConsumoOrm?: SalidaBienConsumoOrm[];


    @HasOne(() => DocumentoTransaccionOrm)
    declare documentoTransaccionOrm?: DocumentoTransaccionOrm;

    @HasOne(() => DocumentoMovimientoOrm)
    declare documentoMovimientoOrm?: DocumentoMovimientoOrm;
}