import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Railway SaaS Platform</title>
        <meta name="description" content="Современная хостинг-платформа на базе Railway" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="gradient-bg min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
              🚀 Railway SaaS Platform
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              ✅ Next.js 13.5.6 + Tailwind CSS работает идеально!
            </p>
          </header>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Status Card */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                🎯 Статус проекта
              </h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center">
                  ✅ <span className="ml-2">Next.js 13.5.6</span>
                </li>
                <li className="flex items-center">
                  ✅ <span className="ml-2">React 18.2.0</span>
                </li>
                <li className="flex items-center">
                  ✅ <span className="ml-2">TypeScript 5</span>
                </li>
                <li className="flex items-center">
                  ✅ <span className="ml-2">Tailwind CSS</span>
                </li>
                <li className="flex items-center">
                  ✅ <span className="ml-2">Pages Router</span>
                </li>
              </ul>
            </div>

            {/* Next Steps Card */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                🔧 Следующие этапы
              </h3>
              <ol className="space-y-3 text-lg list-decimal list-inside">
                <li className="line-through text-green-300">Добавить Tailwind CSS</li>
                <li>Создать AUTH_MODULE</li>
                <li>Railway API интеграция</li>
                <li>PostgreSQL + Drizzle ORM</li>
                <li>Stripe биллинг</li>
              </ol>
            </div>
          </div>

          {/* Success Banner */}
          <div className="glass-card p-8 text-center mb-12 border-green-400/50 bg-green-400/10">
            <h3 className="text-3xl font-bold mb-4">
              🎉 Проект готов к разработке!
            </h3>
            <p className="text-xl opacity-90">
              Базовая конфигурация Next.js + Tailwind CSS работает стабильно.
              <br />
              Можно приступать к созданию модулей.
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button className="btn-primary">
                🔐 Создать AUTH_MODULE
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200">
                📚 Посмотреть документацию
              </button>
            </div>
          </div>

          {/* Project Info */}
          <footer className="glass-card p-6 text-center">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">🌐 Домен</div>
                <div className="opacity-80">www.digitalcluster.online</div>
              </div>
              <div>
                <div className="font-semibold">🔗 Railway Project</div>
                <div className="opacity-80 text-xs">e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df</div>
              </div>
              <div>
                <div className="font-semibold">⚡ Технологии</div>
                <div className="opacity-80">Railway + Next.js + TypeScript</div>
              </div>
              <div>
                <div className="font-semibold">🕐 Запущено</div>
                <div className="opacity-80">{new Date().toLocaleString('ru-RU')}</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
