import { DbPreset } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Model, Transaction, UpdateOptions } from 'sequelize';
import { DbPresetOrm } from 'src/infrastructure/entities/Preset/DbPresetOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class DbPresetService {

    constructor(
        @InjectModel(DbPresetOrm) private dbPresetOrm: typeof DbPresetOrm
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.dbPresetOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new DbPreset({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, dbPreset: DbPreset )
    {
        const orm = await this.dbPresetOrm.findOne({
            transaction: s.transaction,
            where: {
                uuid: dbPreset.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new DbPreset({ ...orm.get() });
    }


    async getObjectByTarget( s: SessionData, dbPreset: DbPreset )
    {
        const orm = await this.dbPresetOrm.findOne({
            transaction: s.transaction,
            where: {
                target: dbPreset.target
            }
        });

        if ( !orm ) throw new InternalServerErrorException( 'Target preestablecido invalido' );

        return new DbPreset({ ...orm.get() });
    }


    async update( s: SessionData, dbPreset: DbPreset )
    {
        const [af1] = await this.dbPresetOrm.update({
            valor: dbPreset.valor
        }, {
            transaction: s.transaction,
            where: {
                uuid: dbPreset.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectByUuid( s, dbPreset );
    }
}