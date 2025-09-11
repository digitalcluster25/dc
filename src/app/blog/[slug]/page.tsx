"use client";

import {
  ArrowLeft,
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Lightbulb,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BlogPost {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  content: {
    intro: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };
}

const blogPost: BlogPost = {
  slug: "building-design-system-shadcn-ui",
  title: "Создание дизайн-системы с Shadcn UI",
  author: "Алексей Иванов",
  authorAvatar: "https://library.shadcnblocks.com/images/block/avatar-1.webp",
  date: "15 марта 2024",
  readTime: "10 мин. чтения",
  content: {
    intro: "Дизайн-система — это основа любого современного веб-приложения. Она обеспечивает консистентность, ускоряет разработку и улучшает пользовательский опыт. В этой статье мы рассмотрим, как создать масштабируемую дизайн-систему с использованием компонентов Shadcn UI.",
    sections: [
      {
        id: "section1",
        title: "Как работают налоги и почему они важны",
        content: "Король долго думал и наконец придумал блестящий план: он будет облагать налогом шутки в королевстве. \"В конце концов,\" сказал он, \"все любят хорошую шутку, так что справедливо, что они должны платить за эту привилегию.\" Подданные короля не были в восторге. Они ворчали и жаловались, но король был непреклонен."
      },
      {
        id: "section2", 
        title: "Великое народное восстание",
        content: "Народ королевства, воодушевленный смехом, снова начал рассказывать шутки и каламбуры, и вскоре все королевство было в курсе шутки. Король, видя, насколько счастливее стали его подданные, понял ошибку своих путей и отменил налог на шутки. Шутник был объявлен героем, и королевство жило долго и счастливо."
      },
      {
        id: "section3",
        title: "План короля",
        content: "Король долго думал и наконец придумал блестящий план: он будет облагать налогом шутки в королевстве. \"В конце концов,\" сказал он, \"все любят хорошую шутку, так что справедливо, что они должны платить за эту привилегию.\" Подданные короля не были в восторге. Они ворчали и жаловались, но король был непреклонен."
      }
    ]
  }
};

export default function BlogPostPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(
      observerCallback,
      {
        root: null,
        rootMargin: "0px",
        threshold: 1,
      },
    );

    sections.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (element) {
        observer?.observe(element);
      }
    });

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };

  return (
    <div className="bg-background">
      <PageHeader title={blogPost.title} />
      
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8">
            <a href="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>К блогу</span>
            </a>
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={blogPost.authorAvatar} />
              </Avatar>
              <span>
                <a href="#" className="font-medium">
                  {blogPost.author}
                </a>
                <span className="text-muted-foreground ml-1">
                  {blogPost.date}
                </span>
              </span>

              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blogPost.readTime}
              </span>
            </div>
          </div>
          
          <Separator className="mb-16" />
        
        <div className="relative grid grid-cols-12 gap-6 lg:grid">
          <div className="col-span-12 lg:col-span-8">
            <div>
              <h3 className="mt-3 text-xl font-semibold">
                Что такое дизайн-система и зачем она нужна?
              </h3>
              <p className="text-muted-foreground mt-2 text-lg">
                Дизайн-система — это набор стандартизированных компонентов, правил и принципов, которые помогают создавать консистентные пользовательские интерфейсы. Она включает в себя цветовую палитру, типографику, компоненты и руководящие принципы их использования. Этот подход стал особенно важным после "Великой путаницы западных провинций", где особенно многословный указ о налогах на кур привел к тому, что фермеры три дня приводили своих кур танцевать на королевский бал.
              </p>
            </div>
            
            {blogPost.content.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(ref) => addSectionRef(section.id, ref)}
                className="prose dark:prose-invert my-8"
              >
                <h2>{section.title}</h2>
                <p>{section.content}</p>
                
                {section.id === "section1" && (
                  <>
                    <p>
                      Король долго думал и наконец придумал <a href="#">блестящий план</a>: он будет облагать налогом шутки в королевстве.
                    </p>
                    <blockquote>
                      "В конце концов," сказал он, "все любят хорошую шутку, так что справедливо, что они должны платить за эту привилегию."
                    </blockquote>
                    <p>
                      Подданные короля не были в восторге. Они ворчали и жаловались, но король был непреклонен.
                    </p>
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>Королевский указ!</AlertTitle>
                      <AlertDescription>
                        Помните, все шутки должны быть зарегистрированы в Королевском бюро шуток перед их рассказыванием
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                
                {section.id === "section2" && (
                  <>
                    <p>
                      Народ королевства, воодушевленный смехом, снова начал рассказывать шутки и каламбуры, и вскоре все королевство было в курсе шутки.
                    </p>
                    <div>
                      <table>
                        <thead>
                          <tr>
                            <th>Королевская казна</th>
                            <th>Счастье народа</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Пустая</td>
                            <td>Переполненное</td>
                          </tr>
                          <tr className="even:bg-muted m-0 border-t p-0">
                            <td>Скромная</td>
                            <td>Довольное</td>
                          </tr>
                          <tr className="even:bg-muted m-0 border-t p-0">
                            <td>Полная</td>
                            <td>В восторге</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      Король, видя, насколько счастливее стали его подданные, понял ошибку своих путей и отменил налог на шутки. Шутник был объявлен героем, и королевство жило долго и счастливо.
                    </p>
                  </>
                )}
                
                {section.id === "section3" && (
                  <>
                    <p>
                      Король долго думал и наконец придумал <a href="#">блестящий план</a>: он будет облагать налогом шутки в королевстве.
                    </p>
                    <blockquote>
                      "В конце концов," сказал он, "все любят хорошую шутку, так что справедливо, что они должны платить за эту привилегию."
                    </blockquote>
                    <p>
                      Подданные короля не были в восторге. Они ворчали и жаловались, но король был непреклонен:
                    </p>
                    <ul>
                      <li>1-й уровень каламбуров: 5 золотых монет</li>
                      <li>2-й уровень шуток: 10 золотых монет</li>
                      <li>3-й уровень острот: 20 золотых монет</li>
                    </ul>
                    <p>
                      В результате люди перестали рассказывать шутки, и королевство погрузилось в уныние. Но был один человек, который отказался позволить глупости короля сломить его: придворный шут по имени Шутник.
                    </p>
                  </>
                )}
              </section>
            ))}
          </div>
          
          <div className="sticky top-0 col-span-3 col-start-10 hidden h-fit lg:block">
            <span className="text-lg font-medium">На этой странице</span>
            <nav className="mt-4 text-sm">
              <ul className="space-y-1">
                {blogPost.content.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(section.id);
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }}
                      className={cn(
                        "block py-1 transition-colors duration-200 cursor-pointer",
                        activeSection === section.id
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Поделиться статьей</p>
              <ul className="flex gap-2">
                <li>
                  <a
                    href="#"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
              >
                <ArrowUp className="h-4 w-4" />
                Наверх
              </Button>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
