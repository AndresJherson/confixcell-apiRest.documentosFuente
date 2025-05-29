import { DocumentoFuente, Nota } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { NotaOrm } from 'src/infrastructure/entities/DocumentosFuente/Nota/NotaOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NotaRepository {

    constructor(
        @InjectModel(NotaOrm) private notaOrm: typeof NotaOrm,
        private conectorService: ConectorService
    )
    {}


    async executeCreateColection( s: SessionData, notas: Nota[] )
    {
        await NotaOrm.bulkCreate( notas.map( nota => ({
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
        const af1 = await NotaOrm.destroy({
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
        const data = await this.notaOrm.findAll({
            where: {
                documentoFuenteId: documentoFuente.id
            },
            transaction: s.transaction
        });

        return data.map( entity => new Nota({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nota: Nota )
    {
        const entity = await this.notaOrm.findByPk( nota.id, {
            transaction: s.transaction,
            include: [DocumentoFuenteOrm]
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new Nota({
            ...entity.get(),
            documentoFuente: new DocumentoFuente({ ...entity.get().documentoFuenteOrm?.get() })
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