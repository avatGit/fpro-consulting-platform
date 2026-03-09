import React from 'react'
import './Logo.css'

function Logo({ light = false }) {
    return (
        <div className={`fpro-logo ${light ? 'light' : ''}`}>
            <div className="logo-icon">
                <svg viewBox="0 0 100 100" className="logo-svg">
                    <circle cx="50" cy="50" r="45" className="logo-circle-bg" />
                    <path
                        d="M30 40 C 30 25, 70 25, 70 40 C 70 55, 30 55, 30 70 L 30 80"
                        className="logo-shape-white"
                        fill="none"
                        stroke="white"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    <path
                        d="M30 40 L 70 40"
                        className="logo-line-white"
                        stroke="white"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <div className="logo-text-container">
                <span className="logo-brand">F-PRO</span>
                <span className="logo-tagline">CONSULTING</span>
            </div>
        </div>
    )
}

export default Logo
