import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';

@Injectable()
export class ConectorService {

    constructor(
        @InjectConnection() private sequelize: Sequelize
    )
    {}


    async beginTransaction()
    {
        return await this.sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        })
    }


    async getId( transaction: Transaction, tableName: string )
    {
        const data = await this.sequelize.query<{id:number}>( `select ifnull( max(id) + 1, 1 ) as id from ${tableName}`, {
            transaction: transaction,
            type: QueryTypes.SELECT
        })

        return data[0].id;
    }


    async executeQuery<T>( parameter: {
        target?: { new( ...args: any[] ): T } | ( ( ...args: any[] ) => T[] ),
        transaction: Transaction,
        query: string,
        parameters?: Record<string,any>
    } )
    {
        try {
            const data = await this.sequelize.query( parameter.query, {
                transaction: parameter.transaction,
                replacements: parameter.parameters,
                type: QueryTypes.SELECT
            } );
    
            if ( parameter.target === undefined ) return data as T[];
            if ( !data.length ) return [];
    
            const columnName = Object.keys( data[0] ?? {} )[ 0 ]
            let data2send: T[] = []
    
            if ( parameter.target.prototype ) {
                for ( const item of data ) {
                    data2send.push( new ( parameter.target as {new(...args:any[]): T} )( item[ columnName ] ) )
                }
            }
            else {
                const array = data.map( item => item[ columnName ] )
                data2send = ( parameter.target as (...args:any[])=>T[] )( array )
            }
    
            return data2send;
        }
        catch ( error: any ) {
            console.log( error );
            throw new InternalServerErrorException( 'Error en la lectura de datos' )
        }
    }
}
