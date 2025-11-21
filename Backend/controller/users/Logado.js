import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 

const prisma = new PrismaClient();
const SECRET_KEY = 'ProtegerToken';
export default async function Logado(req, res, next) {
  try {
    const token = req.cookies.Token; 

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
         return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
    
    const userId = decoded.id; 

    if (!userId) {
      return res.status(401).json({ erro: 'Token inválido: ID de usuário ausente.' });
    }

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

    req.userId = userId;
    req.usuario = usuario;

    if (req.method === 'GET' && req.path === '/privado') {
      return res.json({
        id: usuario.id,
        email: usuario.email,
        vbucks: usuario.vbucks,
        createdAt: usuario.createdAt
      });
    }

    next();

  } catch (error) {
    console.error('Erro no middleware Logado:', error);
    return res.status(500).json({ erro: 'Erro ao validar autenticação.' });
  }
}