import {FaUser, FaLock} from "react-icons/fa";

import {useState} from "react";
import { Link } from "react-router-dom";

import "./Login.css";

const Cadastro = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = event =>{
        event.preventDefault();
        
        alert("Enviando os dados: " +username + " - " + password)
    };

  return (
    <div className='Container'>
        <form onSubmit={handleSubmit}>
            <h1>Criar cadastro</h1>
            <div className="input-field">
                <input type="email"
                 placeholder='E-mail' 
                 required
                onChange={(e) => setUsername(e.target.value)}>

                </input>
                <FaUser className='icon' />
            </div>
            <div className="input-field">
                <input type="password" placeholder='Senha'
                onChange={(e) => setPassword(e.target.value)}
                ></input>
                <FaLock className='icon' />
            </div>
            <button>Criar conta</button>

            <div className="signup-link">
                <p>Já possuo uma conta <Link to="/" >Entrar </Link> </p>
            </div>


            
        </form>
      
    </div>
  )
}

export default Cadastro
