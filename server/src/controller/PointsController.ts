import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        // split separa a string 1,2,3 em uma lista [1,2,3] depois transforma em uma lista de numero eliminando os espaços.
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

            console.log(points);

        // como insere o nome da imagem no campo da image, add campo url para pegar o caminho dela
        const serializedPoints = points.map(point => {
            return { 
                ...point,
                image_url: `http://192.168.0.14:3333/uploads/${point.image}`
            }
        })

        response.json(serializedPoints);

    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found' });
        }

        // como insere o nome da imagem no campo da image, add campo url para pegar o caminho dela
        const serializedPoints = {
            ...point,
            image_url: `http://192.168.0.14:3333/uploads/${point.image}`
        }


        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title')


        return response.json({ serializedPoints, items });
    }

    async create(request: Request, response: Response) {

        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await knex.transaction();

        const point = {
            image: request.file.filename, // nome da imagem gerada no arquivo
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const insertedIds = await trx('points').insert(point);
        console.log(insertedIds);

        // point_id recebe o numero da id de ponto que foi inserida;
        const point_id = insertedIds[0];

        // para inserir na tabela pivo point_items percorre o array de itens, que so tem os
        //numeros dos  itens, e pra cada item id percorrido ,retorna o proprio id com o id do ponto
        /*
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            };
        });
        como não e mais json, os itens nao sao mais uma lista de numeros, e sim  uma string por isso:
        */
        const pointItems = String(items).split(',').map(item => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                };
            });

        const insertT = await trx('point_items').insert(pointItems);
        console.log(insertT);

        await trx.commit();

        return response.json({ id: point_id, ...point });
    }
}

export default PointsController;