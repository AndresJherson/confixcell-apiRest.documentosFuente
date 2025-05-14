import { NotaVentaEstado } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvEstadoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvEstadoEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NvEstadoService {

    constructor(
        @InjectModel(NvEstadoEntity) private nvEstadoEntity: typeof NvEstadoEntity,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'nv_estado' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.nvEstadoEntity.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new NotaVentaEstado({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nvEstado: NotaVentaEstado )
    {
        const entity = await this.nvEstadoEntity.findByPk( nvEstado.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new NotaVentaEstado({ ...entity.get() });
    }


    async create( s: SessionData, nvEstado: NotaVentaEstado )
    {
        nvEstado.set({
            id: await this.getId( s )
        });

        await this.nvEstadoEntity.create({
            id: nvEstado.id,
            nombre: nvEstado.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, nvEstado );
    }


    async update( s: SessionData, nvEstado: NotaVentaEstado )
    {
        const [af1] = await this.nvEstadoEntity.update({
            nombre: nvEstado.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: nvEstado.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, nvEstado );
    }


    async delete( s: SessionData, nvEstado: NotaVentaEstado )
    {
        const af1 = await this.nvEstadoEntity.destroy({
            transaction: s.transaction,
            where: {
                id: nvEstado.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}