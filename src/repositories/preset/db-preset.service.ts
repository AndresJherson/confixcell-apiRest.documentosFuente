import { DbPreset } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DbPresetEntity } from 'src/entities/Preset/DbPresetEntity';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class DbPresetService {

    constructor(
        @InjectModel(DbPresetEntity) private dbPresetEntity: typeof DbPresetEntity
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.dbPresetEntity.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new DbPreset({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, dbPreset: DbPreset )
    {
        const entity = await this.dbPresetEntity.findByPk( dbPreset.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new DbPreset({ ...entity.get() });
    }


    async getObjectByTarget( s: SessionData, dbPreset: DbPreset )
    {
        const entity = await this.dbPresetEntity.findOne({
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
        const [af1] = await this.dbPresetEntity.update({
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