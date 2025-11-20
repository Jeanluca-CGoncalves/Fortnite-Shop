import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export default async function Logar(req, res) {
  try {
    // Aceita { email, password } do frontend
    const { email, password } = req.body;

    if (!email || !password) {
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

    const senhaConfere = await bcrypt.compare(password, user.senhaHash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.email },
      'ProtegerToken',
      { expiresIn: '1h' }
    );

    // Cookie HttpOnly e sameSite = lax (funciona para dev local)
    res.cookie('Token', token, { httpOnly: true, sameSite: 'lax' });

    // Retorna user para o frontend (útil para preencher UI)
    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome ?? user.email,
        vbucks: user.vbucks ?? 0
      }
    });

  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ erro: 'Erro interno ao tentar realizar login.' });
  }
}
