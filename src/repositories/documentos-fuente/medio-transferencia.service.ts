import { MedioTransferencia } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MedioTransferenciaEntity } from 'src/entities/MovimientosRecurso/MedioTransferenciaEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class MedioTransferenciaService {

    constructor(
        @InjectModel(MedioTransferenciaEntity) private medioTransferenciaEntity: typeof MedioTransferenciaEntity,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'medio_transferencia' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.medioTransferenciaEntity.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new MedioTransferencia({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, medioTransferencia: MedioTransferencia )
    {
        const entity = await this.medioTransferenciaEntity.findByPk( medioTransferencia.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new MedioTransferencia({ ...entity.get() });
    }


    async create( s: SessionData, medioTransferencia: MedioTransferencia )
    {
        medioTransferencia.set({
            id: await this.getId( s )
        });

        await this.medioTransferenciaEntity.create({
            id: medioTransferencia.id,
            nombre: medioTransferencia.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, medioTransferencia );
    }


    async update( s: SessionData, medioTransferencia: MedioTransferencia )
    {
        const [af1] = await this.medioTransferenciaEntity.update({
            nombre: medioTransferencia.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: medioTransferencia.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, medioTransferencia );
    }


    async delete( s: SessionData, medioTransferencia: MedioTransferencia )
    {
        const af1 = await this.medioTransferenciaEntity.destroy({
            transaction: s.transaction,
            where: {
                id: medioTransferencia.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}