import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero секция */}
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '20px',
        marginBottom: '60px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          ☁️ Облако Fortes
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
          Надежное пространство для ваших файлов
        </p>
        <p style={{ marginBottom: '40px', opacity: 0.9 }}>
          Сохраняйте в Облаке ценные файлы: фото, видео и документы.
          Оно надёжно хранит их и делает доступными на любом вашем устройстве
        </p>
        <div>
          <Link to="/register">
            <button style={{
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              padding: '12px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '15px',
              fontWeight: 'bold'
            }}>
              Создать облако
            </button>
          </Link>
          <Link to="/login">
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '12px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Войти
            </button>
          </Link>
        </div>
      </div>

      {/* Преимущества - шахматный порядок */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* Блок 1 - текст слева, иконка справа */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          marginBottom: '80px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
              🎁 Бесплатные 8 гигабайт — всегда ваши
            </h2>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              Память можно увеличить до 2 терабайт с подпиской,
              но бесплатное пространство у вас есть сразу после начала работы в Облаке
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '80px' }}>💾</div>
          </div>
        </div>

        {/* Блок 2 - иконка слева, текст справа */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          marginBottom: '80px',
          flexWrap: 'wrap',
          flexDirection: 'row-reverse'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
              🔒 Безопасность превыше всего
            </h2>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              Все файлы шифруются при передаче и хранении.
              Только вы имеете доступ к своим данным
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '80px' }}>🛡️</div>
          </div>
        </div>

        {/* Блок 3 - текст слева, иконка справа */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          marginBottom: '80px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
              📱 Доступ с любого устройства
            </h2>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              Загружайте файлы с компьютера, телефона или планшета.
              Все ваши данные всегда под рукой
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '80px' }}>📱💻🖥️</div>
          </div>
        </div>

        {/* Блок 4 - иконка слева, текст справа */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          marginBottom: '80px',
          flexWrap: 'wrap',
          flexDirection: 'row-reverse'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
              🔗 Удобные ссылки для обмена
            </h2>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              Делитесь файлами с друзьями и коллегами по специальной ссылке.
              Управляйте доступом к вашим данным
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '80px' }}>🔗</div>
          </div>
        </div>
      </div>

      {/* Призыв к действию */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '20px',
        marginTop: '40px'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
          Готовы начать?
        </h2>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          Присоединяйтесь к тысячам пользователей Облака Fortes
        </p>
        <Link to="/register">
          <button style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '14px 40px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Создать облако бесплатно
          </button>
        </Link>
      </div>
    </div>
  );
};