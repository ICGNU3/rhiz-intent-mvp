# Security Policy

## Overview

Rhiz is built with security and privacy as core principles. This document outlines our security practices, data protection measures, and security commitments.

## Data Protection

### Encryption

- **Field-Level Encryption**: Sensitive fields (phone numbers) are encrypted at the field level using AES-256-GCM
- **Encryption Keys**: Stored securely in environment variables, never in code or logs
- **Database Encryption**: All data encrypted at rest using PostgreSQL's built-in encryption
- **Transport Encryption**: All data transmitted over HTTPS/TLS 1.3

### Access Control

- **Row-Level Security (RLS)**: All database tables implement RLS based on `owner_id`
- **Multi-Tenancy**: Complete data isolation between users
- **API Authentication**: All API endpoints require proper authentication
- **Principle of Least Privilege**: Minimal access granted to each component

### Data Minimization

- **Purpose Limitation**: Data collected only for specified purposes
- **Data Retention**: Automatic deletion of data after specified periods
- **Minimal Collection**: Only collect data necessary for core functionality
- **Anonymization**: Personal data anonymized where possible

## Security Architecture

### Infrastructure Security

- **Secure Hosting**: Deployed on secure, SOC 2 compliant platforms
- **Network Security**: VPC isolation and firewall rules
- **Secrets Management**: Environment variables and secure secret storage
- **Regular Updates**: Automated security updates and patches

### Application Security

- **Input Validation**: All inputs validated using Zod schemas
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: Content Security Policy and input sanitization
- **CSRF Protection**: CSRF tokens on all state-changing operations

### API Security

- **Rate Limiting**: API rate limiting to prevent abuse
- **Request Validation**: All API requests validated against schemas
- **Error Handling**: Secure error messages without information leakage
- **Audit Logging**: All API access logged for security monitoring

## Data Sources and Processing

### Legitimate Data Sources

We only process data from legitimate, user-authorized sources:

- **Calendar Events**: User-uploaded ICS files or authorized calendar access
- **Voice Notes**: User-recorded audio files
- **Manual Entry**: User-provided information
- **External Providers**: Only with explicit user consent and API keys

### Excluded Data Sources

We explicitly do not collect data from:

- **LinkedIn**: No automation or scraping of LinkedIn profiles
- **Gmail**: No server-side email access or processing
- **Private Pages**: No scraping of private or password-protected content
- **Social Media**: No unauthorized social media data collection

### Data Processing Principles

- **Consent-Based**: All data processing requires explicit consent
- **Transparent**: Clear documentation of what data is collected and why
- **Proportional**: Data processing proportional to stated purposes
- **Secure**: All processing done in secure, controlled environments

## Compliance

### GDPR Compliance

- **Data Subject Rights**: Full support for access, rectification, deletion
- **Consent Management**: Granular consent tracking with lawful basis
- **Data Portability**: Export capabilities for user data
- **Breach Notification**: 72-hour breach notification procedures

### Privacy by Design

- **Default Privacy**: Privacy settings default to most restrictive
- **Privacy Controls**: User controls for data sharing and processing
- **Transparency**: Clear privacy notices and data processing information
- **Accountability**: Regular privacy audits and assessments

## Security Monitoring

### Logging and Monitoring

- **Security Events**: All security-relevant events logged
- **Access Monitoring**: Real-time monitoring of data access
- **Anomaly Detection**: Automated detection of suspicious activity
- **Incident Response**: Defined procedures for security incidents

### Vulnerability Management

- **Regular Scanning**: Automated vulnerability scanning
- **Dependency Updates**: Regular updates of dependencies
- **Security Testing**: Regular penetration testing
- **Bug Bounty**: Security bug bounty program

## Incident Response

### Security Incident Procedures

1. **Detection**: Automated and manual detection of security incidents
2. **Assessment**: Rapid assessment of incident scope and impact
3. **Containment**: Immediate containment of security threats
4. **Eradication**: Complete removal of security threats
5. **Recovery**: Restoration of normal operations
6. **Lessons Learned**: Post-incident analysis and improvements

### Communication

- **User Notification**: Prompt notification of affected users
- **Regulatory Reporting**: Compliance with breach notification requirements
- **Transparency**: Open communication about security incidents
- **Support**: Dedicated support for security-related inquiries

## Security Commitments

### Our Promises

- **No Unauthorized Access**: We will never access user data without authorization
- **No Data Selling**: We will never sell user data to third parties
- **No Hidden Processing**: All data processing is transparent and documented
- **Continuous Improvement**: Regular security assessments and improvements

### User Rights

- **Data Access**: Right to access all personal data we hold
- **Data Correction**: Right to correct inaccurate personal data
- **Data Deletion**: Right to delete personal data (right to be forgotten)
- **Data Portability**: Right to export personal data in machine-readable format
- **Consent Withdrawal**: Right to withdraw consent at any time

## Security Contact

For security-related inquiries, vulnerabilities, or incidents:

- **Security Email**: security@rhiz.ai
- **Bug Reports**: GitHub Security Advisories
- **Responsible Disclosure**: We welcome responsible disclosure of security issues

## Security Updates

This security policy is reviewed and updated regularly. Users will be notified of significant changes to our security practices.

**Last Updated**: January 2024
**Version**: 1.0
