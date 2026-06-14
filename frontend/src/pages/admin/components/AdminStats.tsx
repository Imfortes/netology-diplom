import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

interface AdminStatsProps {
  totalUsers: number;
  regularCount: number;
  adminCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ totalUsers, regularCount, adminCount }) => {
  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-primary bg-opacity-10 h-100">
          <Card.Body className="text-center d-flex flex-column justify-content-center">
            <div className="display-4 mb-2">👥</div>
            <h3 className="mb-0">{totalUsers}</h3>
            <small className="text-muted">Всего пользователей</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-success bg-opacity-10 h-100">
          <Card.Body className="text-center d-flex flex-column justify-content-center">
            <div className="display-4 mb-2">👤</div>
            <h3 className="mb-0">{regularCount}</h3>
            <small className="text-muted">Обычных пользователей</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-warning bg-opacity-10 h-100">
          <Card.Body className="text-center d-flex flex-column justify-content-center">
            <div className="display-4 mb-2">👑</div>
            <h3 className="mb-0">{adminCount}</h3>
            <small className="text-muted">Администраторов</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};