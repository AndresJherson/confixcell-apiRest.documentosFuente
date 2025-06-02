import { ComprobanteTipo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ComprobanteTipoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/ComprobanteTipoOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class ComprobanteTipoService {

    constructor(
        @InjectModel(ComprobanteTipoOrm) private comprobanteTipoOrm: typeof ComprobanteTipoOrm,
    )
    {}

    async getCollection( s: SessionData )
    {
        const data = await this.comprobanteTipoOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new ComprobanteTipo({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: ComprobanteTipo )
    {
        const orm = await this.comprobanteTipoOrm.findOne({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new ComprobanteTipo({ ...orm.get() });
    }


    async create( s: SessionData, item: ComprobanteTipo )
    {
        item.set({
            uuid: v4()
        });

        await this.comprobanteTipoOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: ComprobanteTipo )
    {
        const [af1] = await this.comprobanteTipoOrm.update({
            nombre: item.nombre ?? null as any
        }, {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectByUuid( s, item );
    }


    async delete( s: SessionData, item: ComprobanteTipo )
    {
        const af1 = await this.comprobanteTipoOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}