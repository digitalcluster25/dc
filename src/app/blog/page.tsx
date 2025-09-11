import { ArrowUpRightIcon } from 'lucide-react';
import React from 'react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BlogPost {
  href: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    href: '/blog/building-design-system-shadcn-ui',
    date: '15 марта 2024',
    title: 'Создание дизайн-системы с Shadcn UI',
    content: 'Изучите, как создать масштабируемую дизайн-систему с использованием компонентов Shadcn UI. Мы рассмотрим композицию компонентов, темизацию и лучшие практики для поддержания консистентности в вашем приложении. Узнайте, как использовать мощь примитивов Radix UI, сохраняя чистоту и поддерживаемость кодовой базы.',
    tags: ['Дизайн-системы', 'Shadcn UI', 'React', 'Tailwind CSS', 'UI Разработка'],
  },
  {
    href: '/blog/headless-ui-components-rise',
    date: '10 марта 2024',
    title: 'Восход Headless UI компонентов',
    content: 'Исследуйте преимущества headless UI компонентов и то, как они революционизируют веб-разработку. Мы сравним популярные headless библиотеки, обсудим соображения доступности и покажем, как создавать гибкие, нестилизованные компоненты, которые можно настроить под любую дизайн-систему.',
    tags: ['Headless UI', 'Доступность', 'Архитектура компонентов', 'React', 'Веб-разработка'],
  },
  {
    href: '/blog/optimizing-component-libraries-performance',
    date: '5 марта 2024',
    title: 'Оптимизация библиотек компонентов для производительности',
    content: 'Узнайте, как оптимизировать библиотеки компонентов для максимальной производительности. Мы рассмотрим методы ленивой загрузки, tree shaking, code splitting и другие техники, которые помогут создать быстрые и эффективные React приложения.',
    tags: ['Производительность', 'Оптимизация', 'React', 'Bundle Size', 'Code Splitting'],
  },
  {
    href: '/blog/modern-react-patterns',
    date: '28 февраля 2024',
    title: 'Современные паттерны в React разработке',
    content: 'Изучите современные паттерны и лучшие практики в React разработке. От custom hooks до compound components, от render props до higher-order components - мы рассмотрим все актуальные подходы для создания масштабируемых React приложений.',
    tags: ['React', 'Паттерны', 'Custom Hooks', 'HOC', 'Render Props'],
  },
  {
    href: '/blog/typescript-modern-web-development',
    date: '20 февраля 2024',
    title: 'TypeScript в современной веб-разработке',
    content: 'Погрузитесь в мир TypeScript и узнайте, как он может улучшить вашу веб-разработку. Мы рассмотрим продвинутые типы, утилиты, generics и покажем, как создавать типобезопасные приложения с отличным developer experience.',
    tags: ['TypeScript', 'Типизация', 'Веб-разработка', 'Developer Experience', 'Безопасность типов'],
  }
];

export default function BlogPage() {
  return (
    <div className="bg-background">
      <PageHeader title="Блог" />

      <section className="py-8 md:py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <React.Fragment key={index}>
              <Card className="border-none shadow-none">
                <CardContent className="px-0">
                  <div className="relative w-full">
                    <p className="text-sm tracking-tight text-muted-foreground">
                      {post.date}
                    </p>

                    <h2 className="mt-2 text-lg font-medium tracking-tight text-foreground md:text-2xl">
                      {post.title}
                    </h2>

                    <p className="md:text-md mt-4 text-sm text-muted-foreground md:pr-24 xl:pr-32">
                      {post.content}
                    </p>

                    <div className="mt-4 flex w-9/10 flex-wrap items-center gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="h-6 rounded-md"
                        >
                          <span className="text-md font-medium text-muted-foreground">
                            {tag}
                          </span>
                        </Badge>
                      ))}
                    </div>

                    <a href={post.href}>
                      <Button
                        variant="secondary"
                        className="absolute -right-3 -bottom-1 flex h-10 w-10 items-center justify-center rounded-full transition-all ease-in-out hover:rotate-45 md:bottom-14"
                      >
                        <ArrowUpRightIcon />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {index < blogPosts.length - 1 && (
                <Separator className="h-px w-full" />
              )}
            </React.Fragment>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
