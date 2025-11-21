import express from 'express';
import Comprar from '../controller/store/comprar.js';
import Logado from '../controller/users/Logado.js';


import BuscarLoja from '../controller/store/BuscarLoja.js';

const router = express.Router();

router.post('/comprar', Logado, Comprar);
router.get('/itens', BuscarLoja);

export default router;