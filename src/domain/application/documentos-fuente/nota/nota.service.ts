import { DocumentoFuente, Nota } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DestroyOptions, FindOptions, Transaction, UpdateOptions } from 'sequelize';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { NotaOrm } from 'src/infrastructure/entities/DocumentosFuente/Nota/NotaOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class NotaService {

    constructor(
        @InjectModel(NotaOrm) private notaOrm: typeof NotaOrm,
    )
    {}


    async getCollectionByDocumentoUuid( s: SessionData, documentoFuente: DocumentoFuente )
    {
        const data = await this.notaOrm.findAll({
            where: {
                documentoFuenteId: documentoFuente.id
            },
            transaction: s.transaction
        });

        return data.map( orm => new Nota({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: Nota )
    {
        const orm = await this.notaOrm.findOne({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            },
            include: [DocumentoFuenteOrm]
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new Nota({
            ...orm.get(),
            documentoFuente: new DocumentoFuente({ ...orm.get().documentoFuenteOrm?.get() })
        });
    }


    async create( s: SessionData, item: Nota )
    {
        item.set({
            uuid: v4()
        });

        await NotaOrm.create({
            uuid: item.uuid,
            documentoFuenteId: item.documentoFuente?.id,
            fecha: item.fecha,
            descripcion: item.descripcion,
            usuarioUuid: item.usuario?.uuid
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async delete( s: SessionData, item: Nota )
    {
        const af1 = await NotaOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}