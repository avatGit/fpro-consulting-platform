import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import './Navbar.css'

function Navbar() {
    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <Logo />
                    </Link>

                </div>
            </div>
        </nav>
    )
}

export default Navbar
