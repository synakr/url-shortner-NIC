# Authentication & Security Roadmap

## TODO

### High Priority

- Move JWT secret to environment variables
- Move Neon database credentials to environment variables
- Add DTO validation
- Add global exception handling
- Standardize API responses

### Medium Priority

- Role-based access control (USER, ADMIN)
- Method-level authorization using @PreAuthorize
- Refresh token implementation
- Logout functionality
- Secure password policy

### Low Priority

- Dockerized local development setup
- Authentication unit tests
- Integration tests
- Security audit logging

---

## Future Scope

### Authentication Improvements

- Cookie-based authentication using secure HttpOnly cookies
- Remember-me functionality
- Session management
- Token revocation / blacklist

### User Management

- Email verification
- Password reset
- Change password endpoint
- Account deactivation

### OAuth & SSO

- Google OAuth
- GitHub OAuth
- Enterprise SSO

### Advanced Security

- Multi-factor authentication (MFA)
- Device tracking
- Login history
- Suspicious activity detection
- Rate limiting

### Infrastructure

- GitHub Secrets integration
- Secret rotation
- Production security profiles
- Redis-backed token/session management

### Monitoring

- Authentication analytics
- Security event monitoring
- Audit logging
