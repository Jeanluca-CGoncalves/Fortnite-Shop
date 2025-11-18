import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import { Prisma } from '@prisma/client';

export default async function Registrar(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const db = await open({
      filename: './prisma/dev.db',
      driver: sqlite3.Database
    });

    const existingUser = await db.get('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.run(
      'INSERT INTO Usuario (id, email, senhaHash, vbucks, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [crypto.randomUUID(), email, senhaHash, 10000]
    );

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ erro: 'Erro interno ao tentar registrar o usuário.' });
  }

}
