import express from 'express';
import Comprar from '../controller/store/comprar.js';
import Logado from '../controller/users/Logado.js';
import Devolver from '../controller/store/devolver.js';
// 1. Importe o controller novo
import BuscarLoja from '../controller/store/BuscarLoja.js';

const router = express.Router();

router.post('/comprar', Logado, Comprar);
router.post('/devolver', Logado, Devolver);

// 2. Adicione a rota GET (Pública, não precisa de 'Logado')
router.get('/itens', BuscarLoja);

export default router;