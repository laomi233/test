import React, { useState } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import './Footer.scss';

const FooterEditConfig = {
    emptyLabel: 'Footer',
    isEmpty: function(props) {
        return !props || !props.title;
    }
};

const Footer = (props) => {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const {
        title = 'Receive the latest updates of Hang Seng Indexes Company',
        subscribeButtonText = 'Subscribe Now',
        companyName = 'Hang Seng Indexes Company Limited',
        companyDescription = 'A wholly-owned subsidiary of Hang Seng Bank',
        sitemapLink = '#',
        disclaimerLink = '#',
        privacyLink = '#',
        maintenanceLink = '#'
    } = props;

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    const handleSubscription = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        setIsSubscribing(true);

        try {
            // Simulate API call - replace with actual subscription endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Replace with actual subscription logic
            console.log('Subscribing email:', email);
            
            setEmail('');
            showMessage('Thank you for subscribing!', 'success');
        } catch (error) {
            console.error('Subscription error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubscription(e);
        }
    };

    return (
        <footer className="footer-component">
            <div className="footer-container">
                {/* Newsletter Subscription Section */}
                <div className="footer-newsletter">
                    <h3 className="footer-newsletter-title">{title}</h3>
                    <form className="footer-newsletter-form" onSubmit={handleSubscription}>
                        <input
                            type="email"
                            className="footer-email-input"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSubscribing}
                        />
                        <button
                            type="submit"
                            className="footer-subscribe-btn"
                            disabled={isSubscribing}
                        >
                            <span className="footer-subscribe-text">
                                {isSubscribing ? 'Subscribing...' : subscribeButtonText}
                            </span>
                            {!isSubscribing && (
                                <svg className="footer-subscribe-icon" width="16" height="16" viewBox="0 0 16 16">
                                    <path
                                        d="M2 8L14 8M14 8L8 2M14 8L8 14"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Navigation Links */}
                <div className="footer-navigation">
                    <div className="footer-nav-left">
                        <a href={sitemapLink} className="footer-nav-link">Sitemap</a>
                        <a href={disclaimerLink} className="footer-nav-link">Disclaimer</a>
                        <a href={privacyLink} className="footer-nav-link">Personal Information Collection Statement</a>
                        <a href={maintenanceLink} className="footer-nav-link">System Maintenance Schedule</a>
                    </div>
                    <div className="footer-nav-right">
                        <div className="footer-company-info">
                            <div className="footer-company-name">{companyName}</div>
                            <div className="footer-company-description">{companyDescription}</div>
                        </div>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`footer-message footer-message-${messageType}`}>
                        {message}
                    </div>
                )}
            </div>
        </footer>
    );
};

MapTo('hsi/components/footer')(Footer, FooterEditConfig);

export default Footer;