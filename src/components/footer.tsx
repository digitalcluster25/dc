"use client";

import { useEffect, useState } from "react";

export function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/Moscow",
        hour: "2-digit" as const,
        minute: "2-digit" as const,
        second: "2-digit" as const,
      };
      const moscowTime = new Intl.DateTimeFormat("ru-RU", options).format(
        new Date(),
      );
      setTime(moscowTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className="mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">
        <div>
          <div className="aspect-[13.7] w-full flex items-center justify-center py-8">
            <div className="relative">
              <div className="text-6xl md:text-8xl font-bold text-foreground tracking-tight leading-none">
                Digital Cluster 25
              </div>
              <div className="absolute inset-0 text-6xl md:text-8xl font-bold text-foreground tracking-tight leading-none overflow-hidden">
                <div className="relative h-full">
                  <div className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-background"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 md:h-6 bg-background"></div>
                  <div className="opacity-0">Digital Cluster 25</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between py-6 text-muted-foreground md:flex-row">
            <div>Онлайн с сентября 2025</div>
            <div>Время → {time}</div>
            <div>hello@digitalcluster.online</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
