import express, { response } from 'express';

const app = express();

app.get('/users', (req, res) => {
	console.log('Hello World Users!!');
	
	res.json([
		'Bruno',
		'Diego',
		'Abacate'
	]);
});

app.listen(3333);