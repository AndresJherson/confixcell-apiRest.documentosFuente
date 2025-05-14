export enum ERROR
{
    ID_INVALIDATE = 'Id invalido',
    NON_CREATE = 'Ningun dato ha sido creado',
    NON_READ = 'Ningun dato ha sido leido',
    NON_UPDATE = 'Ningun dato ha sido actualizado',
    NON_DELETE = 'Ningun dato ha sido eliminado',
    NON_SET_SERVICE = 'Servicio no establecido'
}

export enum ERROR_DOCUMENT
{
    DATETIME_ISSUE_INVALIDATE = 'Fecha de emision invalido',
    CANT_UPDATE_FROM_ISSUED = 'No se puede actualizar un documento emitido',
    CANT_UPDATE_FROM_VOID = 'No se puede actualizar un documento anulado',
    CANT_DELETE_FROM_ISSUED = 'No se puede eliminar un documento emitido',
    CANT_DELETE_FROM_VOID = 'No se puede eliminar un documento anulado',
    CANT_ISSUE_WITHOUT_SERIE = 'No se puede emitir si el código de serie',
}