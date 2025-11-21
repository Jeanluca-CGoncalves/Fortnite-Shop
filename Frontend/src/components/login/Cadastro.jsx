import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

const Cadastro = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/register", {
  email,
  password: senha, 
});

      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao criar conta: " + error.response?.data?.erro);
    }
  };

  return (
    <div className="Container">
      <form onSubmit={handleSubmit}>
        <h1>Criar cadastro</h1>

        <div className="input-field">
          <input
            type="email"
            placeholder="E-mail"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            required
            onChange={(e) => setSenha(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <button>Criar conta</button>

        <div className="signup-link">
          <p>
            Já possuo uma conta <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
