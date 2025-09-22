export default function Home() {
  return (
    <div style={{ 
      padding: '3rem 2rem', 
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 4rem)', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🚀 Railway SaaS Platform
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            marginBottom: '2rem'
          }}>
            ✅ Next.js 13.5.6 работает идеально!
          </p>
        </header>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
              🎯 Статус проекта
            </h2>
            <ul style={{ 
              listStyleType: 'none', 
              padding: 0, 
              margin: 0,
              lineHeight: '2'
            }}>
              <li>✅ Next.js 13.5.6</li>
              <li>✅ React 18.2.0</li>
              <li>✅ TypeScript 5</li>
              <li>✅ Pages Router</li>
              <li>✅ Стабильная конфигурация</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
              🔧 Следующие этапы
            </h3>
            <ol style={{ 
              paddingLeft: '1.5rem', 
              margin: 0,
              lineHeight: '2'
            }}>
              <li>Добавить Tailwind CSS</li>
              <li>Создать AUTH_MODULE</li>
              <li>Railway API интеграция</li>
              <li>PostgreSQL + Drizzle ORM</li>
              <li>Stripe биллинг</li>
            </ol>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          border: '2px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
            🎉 Проект готов к разработке!
          </h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            Базовая конфигурация Next.js работает стабильно.<br/>
            Можно приступать к созданию модулей.
          </p>
        </div>
        
        <footer style={{ 
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.8,
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '2rem'
        }}>
          <p>🌐 <strong>Домен:</strong> www.digitalcluster.online</p>
          <p>🔗 <strong>Railway Project:</strong> e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df</p>
          <p>⚡ <strong>Технологии:</strong> Railway + Next.js + TypeScript</p>
          <p>🕐 <strong>Запущено:</strong> {new Date().toLocaleString('ru-RU')}</p>
        </footer>
      </div>
    </div>
  )
}
