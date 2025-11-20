import express from 'express';

import Logar from '../controller/users/Logar.js';
import Refund from '../controller/users/Refund.js';
import Logado from '../controller/users/Logado.js';
import Deslogar from '../controller/users/Deslogar.js';
import Registrar from '../controller/users/Registrar.js';
import MeusItens from '../controller/users/MeusItens.js';
import Historico from '../controller/users/Historico.js';
import ItensOutrosUsuarios from '../controller/users/ItensOutrosUsuarios.js';

import { listarInventario, verInventarioOutroUsuario } from '../controller/users/Inventario.js';

const router = express.Router();

// Rotas públicas
router.post('/login', Logar);
router.post('/deslogar', Deslogar);
router.post('/register', Registrar);

// ✅ ROTA PARA BUSCAR DADOS DO USUÁRIO LOGADO (incluindo v-bucks)
router.get('/privado', Logado);

// Rotas protegidas
router.post('/refund', Logado, Refund);
router.get('/inventario', Logado, listarInventario);
router.get('/inventario/:id', verInventarioOutroUsuario);
router.get('/itens', Logado, MeusItens);
router.get('/historico', Logado, Historico);
router.get('/:id/itens', Logado, ItensOutrosUsuarios);

export default router;