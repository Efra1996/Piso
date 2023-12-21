export interface Productos {
    nombre: string,
    precio: number,
    comprado: boolean
}
export interface Historial {
    nombre: string,
    productos: Productos[],
    fecha: string,
    total : number
}
export interface Cuentas {
    nombre: string,
    saldo : number
}