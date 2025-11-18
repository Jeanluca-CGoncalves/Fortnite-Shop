import express from 'express';

import Logar from '../controller/users/Logar.js';
import Logado from '../controller/users/Logado.js';
import Deslogar from '../controller/users/Deslogar.js';
import Registrar from '../controller/users/Registrar.js';
import MeusItens from '../controller/users/MeusItens.js';
import Historico from '../controller/users/Historico.js';
import ItensOutrosUsuarios from '../controller/users/ItensOutrosUsuarios.js';

import { listarInventario, verInventarioOutroUsuario } from '../controller/users/Inventario.js';

const router = express.Router();

router.post('/login', Logar); router.post('/deslogar', Deslogar);
router.post('/register', Registrar);

router.get('/privado', Logado, (req, res) => res.send('Acesso liberado!'));
router.get('/inventario', Logado, listarInventario);
router.get('/inventario/:id', verInventarioOutroUsuario);
router.get('/itens', Logado, MeusItens);
router.get('/historico', Logado, Historico);

router.get('/:id/itens', Logado, ItensOutrosUsuarios);

export default router;