// level-up-gaming-backend/src/utils/dbUtils.ts

import fs from 'fs';
import path from 'path';

// Define el tipo genérico para nuestros datos
export type DbTable = 'users' | 'orders' | 'products'; // Ampliable en el futuro

/**
 * Lee y parsea un archivo JSON de la base de datos.
 * @param table El nombre de la tabla (ej: 'users') que corresponde al archivo .json
 * @returns Un array de objetos del tipo especificado.
 */
export const readFromDb = <T>(table: DbTable): T[] => {
    const dbPath = path.resolve(__dirname, `../db/${table}.json`);
    try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data) as T[];
    } catch (error) {
        // Si el archivo no existe o hay un error, retorna una lista vacía.
        console.error(`Error reading from ${table}.json:`, error);
        return [];
    }
};

/**
 * Escribe un array de datos a un archivo JSON en la base de datos.
 * @param table El nombre de la tabla (ej: 'users') que corresponde al archivo .json
 * @param data El array de datos a escribir.
 */
export const writeToDb = <T>(table: DbTable, data: T[]): void => {
    const dbPath = path.resolve(__dirname, `../db/${table}.json`);
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error(`Error writing to ${table}.json:`, error);
    }
};
