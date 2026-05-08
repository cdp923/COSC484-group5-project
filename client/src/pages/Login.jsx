import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./styles/Login.css";

export default function Login() {

    const [loginData, setLoginData] = useState({ username: "", password: "" })
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value })
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                username: loginData.username,
                password: loginData.password
            })

            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                navigate("/dashboard");
            }

        } catch (error) {
            console.error(error);
            setError(error.response.data.message);
        }

    };

    return (
        <section id="login-page">
            <div id="logInText">
                <h1>Log In</h1>
            </div>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" onChange={handleChange} required />
                </div>

                <button type="submit" className="btn btn-secondary">Sign In</button>
                {error && <p className="error">{error}</p>}
            </form>
        </section>
    );
}