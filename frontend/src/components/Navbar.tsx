import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Nav, Navbar as BootstrapNavbar, Button } from 'react-bootstrap';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo"
            height="32"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
          <span>Облако Fortes</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>

            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Мои файлы</Nav.Link>
                {user.is_admin && (
                  <Nav.Link as={Link} to="/admin">Админ панель</Nav.Link>
                )}
                <Nav.Link className="text-muted">Привет, {user.username}!</Nav.Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-primary" size="sm">
                    Войти
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">
                    Регистрация
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};