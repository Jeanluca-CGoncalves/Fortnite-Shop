// Backend/controller/users/Logado.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Logado(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    // Decodificar o token (assumindo que está em Base64)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }

    // ✅ BUSCAR USUÁRIO COM VBUCKS ATUALIZADOS
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        vbucks: true,
        createdAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Adicionar userId ao request para os próximos middlewares
    req.userId = userId;
    req.usuario = usuario;

    // ✅ Se for uma requisição GET para /privado, retornar os dados do usuário
    if (req.method === 'GET' && req.path === '/privado') {
      return res.json({
        id: usuario.id,
        email: usuario.email,
        vbucks: usuario.vbucks,
        createdAt: usuario.createdAt
      });
    }

    // Caso contrário, continuar para o próximo middleware
    next();

  } catch (error) {
    console.error('Erro no middleware Logado:', error);
    return res.status(500).json({ erro: 'Erro ao validar autenticação.' });
  }
}