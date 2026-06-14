import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

interface AdminInfoCardProps {
  onRefresh: () => void;
}

export const AdminInfoCard: React.FC<AdminInfoCardProps> = ({ onRefresh }) => {
  return (
    <Card className="mt-4 bg-light border-0">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center gap-2">
              <span className="display-6">ℹ️</span>
              <div>
                <h6 className="mb-1 fw-semibold">Информация о правах доступа</h6>
                <p className="small text-muted mb-0">
                  Администраторы имеют доступ к управлению пользователями и могут просматривать файлы всех пользователей.
                  Обычные пользователи имеют доступ только к своим файлам. Бесплатный тариф: 1 GB, расширение до 100 GB.
                </p>
              </div>
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button
              variant="primary"
              size="sm"
              onClick={onRefresh}
            >
              🔄 Обновить список
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};