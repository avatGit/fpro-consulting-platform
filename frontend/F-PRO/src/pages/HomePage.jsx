import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './HomePage.css'

function HomePage() {
    const services = [
        {
            id: 1,
            title: 'Consommables',
            icon: '🖨️',
            description: 'Papier, encres, accessoires informatiques'
        },
        {
            id: 2,
            title: 'Maintenance',
            icon: '🔧',
            description: 'Maintenance équipements informatiques et bureautiques'
        },
        {
            id: 3,
            title: 'Solutions Digitales',
            icon: '💻',
            description: 'Développement web, applications et solutions sur mesure'
        }
    ]

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text fade-in">
                            <h1 className="hero-title">
                                Services professionnels<br />
                                adaptés aux entreprises
                            </h1>
                            <p className="hero-description">
                                Support informatique, maintenance<br />
                                et solutions digitales pour vos besoins
                            </p>
                            <div className="hero-buttons">
                                <Link to="/register" className="btn btn-primary btn-large">
                                    Créer votre compte
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-large">
                                    ✨ Voir les services
                                </Link>
                            </div>
                        </div>

                        <div className="hero-image slide-in-right">
                            <div className="hero-illustration">
                                <div className="illustration-bg"></div>
                                <div className="tech-icons">
                                    <div className="tech-icon icon-1">💼</div>
                                    <div className="tech-icon icon-2">🖥️</div>
                                    <div className="tech-icon icon-3">📱</div>
                                    <div className="tech-icon icon-4">⚙️</div>
                                    <div className="tech-icon icon-5">🔒</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            La plateforme tout - en - un pour votre entreprise
                        </h2>
                    </div>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className="service-card fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="service-icon">{service.icon}</div>
                                <h3 className="service-title">{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                                <Link to="/login" className="btn-discover">Découvrir</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        © 2026 F-PRO CONSULTING. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
