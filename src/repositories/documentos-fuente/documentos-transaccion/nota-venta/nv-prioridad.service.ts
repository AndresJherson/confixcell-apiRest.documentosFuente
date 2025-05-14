import { NotaVentaPrioridad } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvPrioridadEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvPrioridadEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NvPrioridadService {

    constructor(
        @InjectModel(NvPrioridadEntity) private nvPrioridadEntity: typeof NvPrioridadEntity,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'nv_prioridad' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.nvPrioridadEntity.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new NotaVentaPrioridad({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const entity = await this.nvPrioridadEntity.findByPk( nvPrioridad.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new NotaVentaPrioridad({ ...entity.get() });
    }


    async create( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        nvPrioridad.set({
            id: await this.getId( s )
        });

        await this.nvPrioridadEntity.create({
            id: nvPrioridad.id,
            nombre: nvPrioridad.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, nvPrioridad );
    }


    async update( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const [af1] = await this.nvPrioridadEntity.update({
            nombre: nvPrioridad.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: nvPrioridad.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, nvPrioridad );
    }


    async delete( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const af1 = await this.nvPrioridadEntity.destroy({
            transaction: s.transaction,
            where: {
                id: nvPrioridad.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}