import jwt from 'jsonwebtoken';

export default async function Logado(req, res, next) {
  const Auth = req.cookies.Token || null;

  if (!Auth) {
    return res.send({ erro: { login: 'Não autorizado.' } });
  }

  try {
    const Token = await jwt.verify(Auth, 'ProtegerToken');
    req.userId = Token.id;
    req.userName = Token.nome;
    next();
  } catch {
    return res.send({ erro: { login: 'Não autorizado.' } });
  }
}
