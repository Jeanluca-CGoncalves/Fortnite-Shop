import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Comprar(req, res) {
  const usuarioIdRaw = req.userId;
  const { cosmeticoId } = req.body;
  
  let usuarioId = String(usuarioIdRaw); 

  if (!usuarioId || usuarioId === 'undefined') {
    return res.status(401).json({ erro: 'Usuário não autenticado ou ID inválido.' });
  }

  try {
    const [usuario, item] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: usuarioId } }),
      prisma.cosmetico.findUnique({ where: { id: cosmeticoId } }),
    ]);

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    
    const precoItem = item.preco ?? 0;

    if (precoItem > usuario.vbucks) {
      return res.status(401).json({ erro: 'Saldo insuficiente.' });
    }

    const jaComprou = await prisma.itemComprado.findFirst({
      where: { usuarioId: usuario.id, cosmeticoId: item.id },
    });

    if (jaComprou) {
      return res.status(400).json({ erro: 'Você já possui este item.' });
    }

    const novoSaldo = usuario.vbucks - precoItem;

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { vbucks: novoSaldo },
      }),
      prisma.itemComprado.create({
        data: {
          usuarioId: usuarioId,
          cosmeticoId: cosmeticoId,
        },
      }),
      prisma.historicoTransacao.create({
        data: {
          usuarioId: usuarioId,
          tipo: 'COMPRA',
          valorVbucks: precoItem, 
        },
      }),
    ]);

    return res.json({
      mensagem: `Compra de ${item.nome} realizada com sucesso!`,
      item: item.nome,
      preco: precoItem,
      saldoAnterior: usuario.vbucks,
      saldoAtual: novoSaldo,
      novoSaldo: novoSaldo, 
    });

  } catch (error) {
    console.error('❌ Erro FATAL ao processar compra:', error.message);
    
    res.status(500).json({ erro: 'Erro interno ao processar compra.' });
  }
}