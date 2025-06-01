import { Usuario } from "@confixcell/modelos";
import { Request, Response } from "express";
import { Transaction } from "sequelize";

export interface SessionData
{
    req: Request,
    res: Response,
    transaction: Transaction,
    json: Record<string,any>,
    usuarioSession: Usuario,
    postCommitEvents: (() => Promise<void>)[]
}