import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios';
import api from '../../services/api';

import './CreatePoint.css'

import logo from '../../assets/logo.svg'

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUfResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: '',
	});

	const [selectedUf, setselectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedItems, setselectedItems] = useState<number[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

	const history = useHistory();

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords;

			setInitialPosition([
				latitude,
				longitude
			]);
		});
	}, []);

	useEffect(() => {
		api.get('itens').then(resp => {
			setItems(resp.data);
		});
	}, []);

	useEffect(() => {
		axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
			.then(resp => {
				const ufInitials = resp.data.map(uf => uf.sigla);

				setUfs(ufInitials);
			});
	}, []);

	useEffect(() => {
		if (selectedUf === '0')
			return;

		api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
			.then(resp => {
				const cityNames = resp.data.map(city => city.nome);

				setCities(cityNames);
			});
	}, [selectedUf]);

	function hadleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;

		setselectedUf(uf);
	}

	function hadleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;

		setSelectedCity(city);
	}

	function hadleMapClick(event: LeafletMouseEvent) {
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng
		]);

	}

	function hadleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;

		setFormData({ ...formData, [name]: value });
	}

	function hadleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id);

		if (alreadySelected >= 0) {
			const filtereditens = selectedItems.filter(item => item !== id);

			setselectedItems(filtereditens);
		} else
			setselectedItems([...selectedItems, id]);
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;

		const data = {
			name,
			email,
			whatsapp,
			uf,
			city,
			latitude,
			longitude,
			items
		};

		await api.post('points', data);
		
		alert('Ponto de coleta cadastrado!');
		history.push('/');
	}

	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta" />
				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do<br />ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>

						<input
							type="text"
							name="name"
							id="name"
							onChange={hadleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="email">E-Mail</label>

							<input
								type="email"
								name="email"
								id="email"
								onChange={hadleInputChange}
							/>
						</div>
						<div className="field">
							<label htmlFor="whatsapp">Whatsapp</label>

							<input
								type="text"
								name="whatsapp"
								id="whatsapp"
								onChange={hadleInputChange}
							/>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={15} onclick={hadleMapClick}>
						<TileLayer
							attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<Marker position={selectedPosition} />
					</Map>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>

							<select
								name="uf"
								id="uf"
								value={selectedUf}
								onChange={hadleSelectUf}>
								<option value="0">Selecione uma UF</option>
								{ufs.map(uf => (
									<option key={uf} value={uf}>{uf}</option>
								))}
							</select>
						</div>
						<div className="field">
							<label htmlFor="city">Cidade</label>

							<select
								name="city"
								id="city"
								value={selectedCity}
								onChange={hadleSelectCity}
							>

								<option value="0">Selecione uma cidade</option>
								{cities.map(city => (
									<option key={city} value={city}>{city}</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Ítens de coleta</h2>
						<span>Selecione um ou mais ítens abaixo</span>
					</legend>
					<ul className="items-grid">
						{items.map(item => (
							<li key={item.id}
								onClick={() => hadleSelectItem(item.id)}
								className={selectedItems.includes(item.id) ? 'selected' : ''}
							>
								<img src={item.image_url} alt={item.title} />
								<span>{item.title}</span>
							</li>
						))}

					</ul>
				</fieldset>

				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	)
};

export default CreatePoint;