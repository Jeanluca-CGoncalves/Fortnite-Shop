import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("usuario", JSON.stringify(response.data.user));
      alert("Login realizado com sucesso!");
      navigate("/"); 
    } catch (error) {
      console.error("Erro:", error);
      const mensagem = error.response?.data?.erro || "Erro ao conectar.";
      alert(mensagem);
    }
  };

  return (
    <div className='Container'>
      <form onSubmit={handleSubmit}>
        <h1>Acesse o sistema</h1>
        <div className="input-field">
          <input 
            type="email"
            placeholder='E-mail'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className='icon' />
        </div>
        <div className="input-field">
          <input 
            type="password" 
            placeholder='Senha'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className='icon' />
        </div>
        <button type="submit">Entrar</button>
        <div className="signup-link">
          <p>Não tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
        </div>
      </form>
    </div>
  )
}

export default Login;