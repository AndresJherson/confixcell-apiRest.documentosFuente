import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentoFuenteEntity } from '../DocumentoFuenteEntity';

@Table({ tableName: 'nota' })
export class NotaEntity extends Model<NotaEntity, Partial<NotaEntity>> {
    
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
    

    @BelongsTo(() => DocumentoFuenteEntity)
    declare documentoFuenteEntity?: DocumentoFuenteEntity;
}