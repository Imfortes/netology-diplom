import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Очищаем ошибку для этого поля при вводе
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    try {
      await register(formData);
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setServerError('Ошибка соединения с сервером');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white text-center py-3 border-0">
              <h3 className="mb-0">📝 Регистрация</h3>
              <p className="mb-0 small opacity-75">Создайте новый аккаунт</p>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Server Error */}
              {serverError && (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading className="fs-6">❌ Ошибка</Alert.Heading>
                  <p className="mb-0">{serverError}</p>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Username */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    👤 Логин <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="например: john_doe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.username}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted small">
                    Латинские буквы и цифры, первый символ буква, длина 4-20 символов
                  </Form.Text>
                  {errors.username && (
                    <Form.Control.Feedback type="invalid">
                      {errors.username[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    📧 Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.email}
                    disabled={loading}
                  />
                  {errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {errors.email[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Full Name */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    📝 Полное имя <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="full_name"
                    placeholder="Иван Иванов"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.full_name}
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <Form.Control.Feedback type="invalid">
                      {errors.full_name[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    🔒 Пароль <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.password}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted small">
                    Минимум 6 символов: заглавная буква, цифра и спецсимвол
                  </Form.Text>
                  {errors.password && (
                    <Form.Control.Feedback type="invalid">
                      {errors.password[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    🔐 Подтверждение пароля <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password2"
                    placeholder="••••••"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.password2}
                    disabled={loading}
                  />
                  {errors.password2 && (
                    <Form.Control.Feedback type="invalid">
                      {errors.password2[0]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Регистрация...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </Button>

                {/* Link to Login */}
                <div className="text-center">
                  <span className="text-muted">Уже есть аккаунт?</span>{' '}
                  <Link to="/login" className="text-decoration-none">
                    Войти
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Password requirements info */}
          <Card className="mt-3 bg-light border-0">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <small className="text-muted">
                  ✅ Заглавная буква
                </small>
                <small className="text-muted">
                  ✅ Цифра
                </small>
                <small className="text-muted">
                  ✅ Спецсимвол (!@#$%^&*)
                </small>
                <small className="text-muted">
                  ✅ 6+ символов
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};