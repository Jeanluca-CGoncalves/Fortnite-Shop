import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function Registrar(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const db = await open({
      filename: './prisma/dev.db',
      driver: sqlite3.Database
    });

    // Checa duplicado
    const exists = await db.get('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (exists) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(password, 10);

    // Use crypto.randomUUID() para id (Node 14+)
    const id = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString();

    await db.run(
      'INSERT INTO Usuario (id, email, senhaHash, vbucks, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [id, email, senhaHash, 10000]
    );

    const created = await db.get('SELECT * FROM Usuario WHERE email = ?', [email]);

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      user: {
        id: created.id,
        email: created.email,
        nome: created.nome ?? created.email,
        vbucks: created.vbucks ?? 0
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ erro: 'Erro interno ao tentar registrar o usuário.' });
  }
}
