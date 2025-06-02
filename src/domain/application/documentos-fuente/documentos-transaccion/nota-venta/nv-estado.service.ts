import { NotaVentaEstado } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvEstadoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvEstadoOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class NvEstadoService {

    constructor(
        @InjectModel(NvEstadoOrm) private nvEstadoOrm: typeof NvEstadoOrm,
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.nvEstadoOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new NotaVentaEstado({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: NotaVentaEstado )
    {
        const orm = await this.nvEstadoOrm.findOne( {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new NotaVentaEstado({ ...orm.get() });
    }


    async create( s: SessionData, item: NotaVentaEstado )
    {
        item.set({
            uuid: v4()
        });

        await this.nvEstadoOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: NotaVentaEstado )
    {
        const [af1] = await this.nvEstadoOrm.update({
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


    async delete( s: SessionData, item: NotaVentaEstado )
    {
        const af1 = await this.nvEstadoOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}