import { useNavigate } from 'react-router-dom';
import HeroImage from '../assets/hero-img.png';
import "./styles/Home.css";

export default function Home() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate("/dashboard");
        } else {
            navigate("/register");
        }
    };

    return (
        <section id="home">
            <div className="hero">
                <div className="hero-description-container">
                    <h1>Manage your money with confidence</h1>
                    <p>Track your accounts, budgets, and spending in one place. Our app helps you stay organized, see where your money goes, and make smarter decisions every month.</p>
                    <div className="hero-cta-btn">
                        <button className="btn btn-secondary" onClick={handleGetStarted}>Get Started</button>
                    </div>
                </div>
                <div className="hero-img-container">
                    <img src={HeroImage} />
                </div>
            </div>
            
            <div className="features">
                <h3>App Features</h3>

                <div className="feature-grid">
                    <div className="insights grid-item">
                        <h4>Financial Insights</h4>
                        <p>See your financial picture at a glance with dashboard summaries of income, expenses, and account balances.</p>
                    </div>
                    <div className="budget grid-item">
                        <h4>Smart budgeting</h4>
                        <p>Create and manage budgets for every category so you can control spending and reach your savings goals.</p>
                    </div>
                    <div className="security grid-item">
                        <h4>Personal Security</h4>
                        <p>Sign in safely and keep your data protected while staying connected to all your financial activity.</p>
                    </div>
                    <div className="tracker grid-item">
                        <h4>Transaction tracking</h4>
                        <p>Log one-time and recurring transactions, categorize expenses, and monitor trends over time.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}