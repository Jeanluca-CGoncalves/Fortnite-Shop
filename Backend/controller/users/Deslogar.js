export default async function Deslogar(req, res) {
  try {
    res.clearCookie('Token'); 
    res.status(200).json({ mensagem: 'Logout realizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deslogar:', error);
    res.status(500).json({ erro: 'Erro interno ao tentar deslogar.' });
  }
}
