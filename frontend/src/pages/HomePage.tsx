import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero секция */}
      <div className="bg-gradient-primary text-white text-center py-5 mb-5" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Container className="py-5">
          <h1 className="display-1 mb-4">
            ☁️ Облако Fortes
          </h1>
          <p className="lead mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Надежное пространство для ваших файлов
          </p>
          <p className="mb-5" style={{ opacity: 0.9 }}>
            Сохраняйте в Облаке ценные файлы: фото, видео и документы.
            Оно надёжно хранит их и делает доступными на любом вашем устройстве
          </p>
          <div>
            <Link to="/register">
              <Button variant="light" size="lg" className="me-3 fw-bold" style={{ color: '#667eea' }}>
                Создать облако
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline-light" size="lg">
                Войти
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Преимущества */}
      <Container className="mb-5">

        {/* Блок 1 */}
        <Row className="align-items-center mb-5 py-4">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="display-6 mb-3">
              🎁 Бесплатный 1 гигабайт — всегда ваш
            </h2>
            <p className="lead text-muted">
              Память можно увеличить до 100 гигабайт с подпиской,
              но бесплатное пространство у вас есть сразу после начала работы в Облаке
            </p>
          </Col>
          <Col lg={6} className="text-center">
            <div className="display-1">💾</div>
          </Col>
        </Row>

        {/* Блок 2 */}
        <Row className="align-items-center mb-5 py-4 flex-row-reverse">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="display-6 mb-3">
              🔒 Безопасность превыше всего
            </h2>
            <p className="lead text-muted">
              Все файлы шифруются при передаче и хранении.
              Только вы имеете доступ к своим данным
            </p>
          </Col>
          <Col lg={6} className="text-center">
            <div className="display-1">🛡️</div>
          </Col>
        </Row>

        {/* Блок 3 */}
        <Row className="align-items-center mb-5 py-4">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="display-6 mb-3">
              📱 Доступ с любого устройства
            </h2>
            <p className="lead text-muted">
              Загружайте файлы с компьютера, телефона или планшета.
              Все ваши данные всегда под рукой
            </p>
          </Col>
          <Col lg={6} className="text-center">
            <div className="display-1">📱💻🖥️</div>
          </Col>
        </Row>

        {/* Блок 4 */}
        <Row className="align-items-center mb-5 py-4 flex-row-reverse">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="display-6 mb-3">
              🔗 Удобные ссылки для обмена
            </h2>
            <p className="lead text-muted">
              Делитесь файлами с друзьями и коллегами по специальной ссылке.
              Управляйте доступом к вашим данным
            </p>
          </Col>
          <Col lg={6} className="text-center">
            <div className="display-1">🔗</div>
          </Col>
        </Row>
      </Container>

      {/* Призыв к действию */}
      <div className="bg-light text-center py-5 mt-4 rounded-4">
        <Container>
          <h2 className="display-6 mb-3">
            Готовы начать?
          </h2>
          <p className="lead text-muted mb-4">
            Присоединяйтесь к тысячам пользователей Облака Fortes
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" className="px-5 py-3" style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}>
              Создать облако бесплатно
            </Button>
          </Link>
        </Container>
      </div>
    </>
  );
};