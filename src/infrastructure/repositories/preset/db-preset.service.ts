import { DbPreset } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DbPresetOrm } from 'src/infrastructure/entities/Preset/DbPresetOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class DbPresetRepository {

    constructor(
        @InjectModel(DbPresetOrm) private dbPresetOrm: typeof DbPresetOrm
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.dbPresetOrm.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new DbPreset({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, dbPreset: DbPreset )
    {
        const entity = await this.dbPresetOrm.findByPk( dbPreset.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new DbPreset({ ...entity.get() });
    }


    async getObjectByTarget( s: SessionData, dbPreset: DbPreset )
    {
        const entity = await this.dbPresetOrm.findOne({
            transaction: s.transaction,
            where: {
                target: dbPreset.target
            }
        });

        if ( !entity ) throw new InternalServerErrorException( 'Target preestablecido invalido' );

        return new DbPreset({ ...entity.get() });
    }


    async update( s: SessionData, dbPreset: DbPreset )
    {
        const [af1] = await this.dbPresetOrm.update({
            valor: dbPreset.valor
        }, {
            transaction: s.transaction,
            where: {
                id: dbPreset.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, dbPreset );
    }
}