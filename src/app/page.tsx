'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Users,
  Globe,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5'>
        <div className='container mx-auto px-6 max-w-7xl'>
          <div className='text-center space-y-8'>
            <Badge variant='outline' className='text-sm'>
              Сообщество на базе ИИ
            </Badge>
            <h1 className='text-5xl md:text-6xl font-bold tracking-tight'>
              Digital Cluster 25
            </h1>
            <p className='text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed'>
              Будущее предпринимательского нетворкинга
            </p>
            <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
              Пионерское онлайн-сообщество на базе искусственного интеллекта,
              созданное специально для предпринимателей, формирующих будущее.
              Объединяя искусственный интеллект с силой человеческих связей, мы
              поднимаем планку того, чем может стать предпринимательский
              нетворкинг.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button size='lg' className='text-lg px-8 py-6'>
                Присоединиться к сообществу
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button size='lg' variant='outline' className='text-lg px-8 py-6'>
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20'>
        <div className='container mx-auto px-6 max-w-7xl'>
          <div className='text-center space-y-4 mb-16'>
            <h2 className='text-4xl font-bold'>
              Откройте для себя Digital Cluster 25
            </h2>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              Больше чем просто платформа для нетворкинга — это живая экосистема
              на базе ИИ, где амбициозные предприниматели собираются вместе,
              чтобы делиться опытом, учиться и расти.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardHeader>
                <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Brain className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Умное сопоставление на базе ИИ</CardTitle>
                <CardDescription>
                  Интеллектуальные рекомендации ресурсов, партнеров и
                  возможностей, адаптированные под ваши бизнес-цели.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardHeader>
                <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Users className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Глобальное сообщество</CardTitle>
                <CardDescription>
                  Общайтесь с предпринимателями по всему миру, а ИИ обеспечивает
                  локальную релевантность и значимые взаимодействия.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-2 hover:border-primary/50 transition-colors'>
              <CardHeader>
                <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Target className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Персонализированный опыт</CardTitle>
                <CardDescription>
                  Каждое взаимодействие значимо и курируется для максимального
                  эффекта, адаптируясь к вашим уникальным потребностям и стадии
                  роста.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Benefits Section */}
      <section className='py-20 bg-muted/30'>
        <div className='container mx-auto px-6 max-w-7xl'>
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            <div className='space-y-8'>
              <div>
                <h2 className='text-4xl font-bold mb-6'>
                  Как ИИ расширяет возможности нашего сообщества
                </h2>
                <p className='text-lg text-muted-foreground mb-8'>
                  Искусственный интеллект — это двигатель, который питает каждый
                  аспект Digital Cluster 25. С момента присоединения ИИ начинает
                  изучать ваши бизнес-цели, предпочтения и вызовы.
                </p>
              </div>

              <div className='space-y-6'>
                <div className='flex items-start space-x-4'>
                  <CheckCircle className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-2'>
                      Проактивное сопоставление
                    </h3>
                    <p className='text-muted-foreground'>
                      Экономит время и ускоряет ваш путь к успеху с помощью
                      точных рекомендаций.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <CheckCircle className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-2'>
                      Персональный бизнес-ассистент
                    </h3>
                    <p className='text-muted-foreground'>
                      Анализирует ваши данные, предоставляет рыночную аналитику
                      и выделяет релевантные тренды.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <CheckCircle className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-2'>
                      Развивающийся интеллект
                    </h3>
                    <p className='text-muted-foreground'>
                      Постоянно учится и адаптируется по мере роста вашего
                      бизнеса и изменения потребностей.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='relative'>
              <Card className='p-8'>
                <div className='space-y-6'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium'>
                      Анализ ИИ активен
                    </span>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Бизнес-цели</span>
                      <Badge variant='secondary'>Проанализированы</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Рыночные тренды</span>
                      <Badge variant='secondary'>Обновлены</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Связи</span>
                      <Badge variant='secondary'>3 новых совпадения</Badge>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Возможности</span>
                      <Badge variant='secondary'>2 доступны</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className='py-20'>
        <div className='container mx-auto px-6 max-w-7xl'>
          <div className='text-center space-y-4 mb-16'>
            <h2 className='text-4xl font-bold'>
              Почему выбрать Digital Cluster 25?
            </h2>
            <p className='text-xl text-muted-foreground'>
              Ощутите будущее предпринимательской поддержки уже сегодня
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
                <TrendingUp className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold'>Умный нетворкинг</h3>
              <p className='text-muted-foreground'>
                Связи на базе ИИ, которые имеют значение, а не просто случайные
                встречи.
              </p>
            </div>

            <div className='text-center space-y-4'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
                <Lightbulb className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold'>Острые инсайты</h3>
              <p className='text-muted-foreground'>
                Получайте рыночную разведку и анализ трендов, адаптированные под
                вашу отрасль.
              </p>
            </div>

            <div className='text-center space-y-4'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
                <Globe className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold'>Глобальный охват</h3>
              <p className='text-muted-foreground'>
                Общайтесь с предпринимателями по всему миру, сохраняя локальную
                релевантность.
              </p>
            </div>

            <div className='text-center space-y-4'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
                <Users className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold'>Связанный опыт</h3>
              <p className='text-muted-foreground'>
                Бесшовное сочетание технологий и человеческих амбиций для
                максимального эффекта.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-primary text-primary-foreground'>
        <div className='container mx-auto px-6 max-w-7xl text-center'>
          <h2 className='text-4xl font-bold mb-6'>
            Готовы присоединиться к революции?
          </h2>
          <p className='text-xl mb-8 opacity-90'>
            Ваш следующий большой прорыв — всего в одной связи. Присоединяйтесь
            к Digital Cluster 25 и ощутите будущее предпринимательского
            нетворкинга.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' variant='secondary' className='text-lg px-8 py-6'>
              Начать сегодня
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary'
            >
              Запланировать демо
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
