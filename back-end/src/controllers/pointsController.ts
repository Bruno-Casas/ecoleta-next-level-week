import { Request, Response, response } from 'express';
import knex from '../database/connection';

export default {
	index: async (req: Request, res: Response) => {
		const { city, uf, itens } = req.query;

		const parsedItens = String(itens)
			.split(',')
			.map(item => Number(item.trim()));
			
		const points = await knex('points')
			.join('itens_point', 'points.id', '=', 'itens_point.point_id')
			.whereIn('itens_point.item_id', parsedItens)
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*');

		return res.json(points);
	},

	show: async (req: Request, res: Response) => {
		const { id } = req.params;

		const point = await knex('points').where('id', id).first()

		if (!point)
			return response.status(400).json({ message: 'Point not found.' });

		const itens = await knex('itens')
			.join('itens_point', 'itens.id', '=', 'itens_point.item_id')
			.where('itens_point.point_id', id)
			.select('itens.title');

		return res.json({ point, itens });
	},

	create: async (req: Request, res: Response) => {
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items
		} = req.body;

		const point = {
			image: 'image-mock',
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		}

		const trx = await knex.transaction();
		const insertedIds = await trx('points').insert(point);

		const point_id = insertedIds[0];
		const pointItens = items.map((item_id: Number) => {
			return {
				item_id,
				point_id
			}
		});

		await trx('itens_point').insert(pointItens);

		await trx.commit();

		return res.json({ id: point_id, ...point })
	}
};
