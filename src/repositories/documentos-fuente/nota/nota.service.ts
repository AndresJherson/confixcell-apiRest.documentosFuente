import { DocumentoFuente, Nota } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DocumentoFuenteEntity } from 'src/entities/DocumentosFuente/DocumentoFuenteEntity';
import { NotaEntity } from 'src/entities/DocumentosFuente/Nota/NotaEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NotaService {

    constructor(
        @InjectModel(NotaEntity) private notaEntity: typeof NotaEntity,
        private conectorService: ConectorService
    )
    {}


    async executeCreateColection( s: SessionData, notas: Nota[] )
    {
        await NotaEntity.bulkCreate( notas.map( nota => ({
            id: nota.id,
            documentoFuenteId: nota.documentoFuente?.id,
            fecha: nota.fecha,
            descripcion: nota.descripcion,
            usuarioUuid: nota.usuario?.uuid
        }) ), {
            transaction: s.transaction
        } );
    }


    async executeDeleteCollection( s: SessionData, notas: Nota[] )
    {
        const af1 = await NotaEntity.destroy({
            where: {
                id: {
                    [Op.in]: notas.map( nota => nota.id ).filter( id => id !== undefined )
                }
            },
            transaction: s.transaction
        });

        if ( af1 === 0 ) return 0
        else return 1;
    }


    async getId( s: SessionData )
    {
        return this.conectorService.getId( s.transaction, 'nota' );
    }


    async getCollectionByDocumentoId( s: SessionData, documentoFuente: DocumentoFuente )
    {
        const data = await this.notaEntity.findAll({
            where: {
                documentoFuenteId: documentoFuente.id
            },
            transaction: s.transaction
        });

        return data.map( entity => new Nota({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nota: Nota )
    {
        const entity = await this.notaEntity.findByPk( nota.id, {
            transaction: s.transaction,
            include: [DocumentoFuenteEntity]
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new Nota({
            ...entity.get(),
            documentoFuente: new DocumentoFuente({ ...entity.get().documentoFuenteEntity?.get() })
        });
    }


    async create( s: SessionData, nota: Nota )
    {
        nota.set({
            id: await this.getId( s )
        });

        await this.executeCreateColection( s, [ nota ] );

        return await this.getObjectById( s, nota );
    }


    async delete( s: SessionData, nota: Nota )
    {
        const af1 = await this.executeDeleteCollection( s, [ nota ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}