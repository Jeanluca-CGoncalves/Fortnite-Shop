import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export default async function Logar(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const db = await open({
      filename: './prisma/dev.db',
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM Usuario WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaConfere = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }
    const token = jwt.sign(
      { id: user.id, nome: user.email },
      'ProtegerToken',
      { expiresIn: '1h' }
    );

    res.cookie('Token', token, { httpOnly: true });
    res.status(200).json({ mensagem: 'Login realizado com sucesso!' });

  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ erro: 'Erro interno ao tentar realizar login.' });
  }
}
