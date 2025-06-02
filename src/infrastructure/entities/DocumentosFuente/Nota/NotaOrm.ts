import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentoFuenteOrm } from '../DocumentoFuenteOrm';

@Table({ tableName: 'nota' })
export class NotaOrm extends Model<NotaOrm, Partial<NotaOrm>> {
    
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    })
    declare id: number;

    @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
    declare uuid: string;
    
    @ForeignKey(() => DocumentoFuenteOrm)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'documento_fuente_id'
    })
    declare documentoFuenteId: number;
    
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare fecha: string;
    
    @Column({
        type: DataType.STRING(500)
    })
    declare descripcion: string;
    
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'usuario_uuid'
    })
    declare usuarioUuid: string;
    

    @BelongsTo(() => DocumentoFuenteOrm)
    declare documentoFuenteOrm?: DocumentoFuenteOrm;
}