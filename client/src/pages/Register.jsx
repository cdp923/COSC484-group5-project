import HeroImage from "../assets/hero-img.png";
import "./styles/Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const [registerData, setRegisterData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate()
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    const handleChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(`${baseURL}/auth/register`, {
                firstname: registerData.firstname,
                lastname: registerData.lastname,
                username: registerData.username,
                email: registerData.email,
                password: registerData.password
            });

            if (response.status === 201) {
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(error);
            setError(error.response.data.message);
        }
    }

    return (
        <section id="register">

            <div className="register-container">

                <div className="register-description">

                    <h1>Create Your Account</h1>

                    <p>
                        Start managing your finances smarter. Track spending,
                        create budgets, and gain financial insights all in one place.
                    </p>

                    <form className="register-form" onSubmit={handleSubmit}>

                        <div className="name-row">
                            <input type="text" name="firstname" placeholder="First Name" onChange={handleChange} required />
                            <input type="text" name="lastname" placeholder="Last Name" onChange={handleChange} required />
                        </div>

                        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />

                        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />

                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

                        <button type="submit" className="btn btn-secondary" >
                            Register
                        </button>
                        {error && <p className="error">{error}</p>}
                    </form>
                </div>
                <div className="register-img-container">
                    <img src={HeroImage} />
                </div>
            </div>
        </section>
    );
}