'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [{ name: 'Главная', href: '/' }];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center space-x-8'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='h-8 w-8 rounded bg-primary flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-sm'>
                  DC
                </span>
              </div>
              <span className='text-xl font-bold'>DC25</span>
            </Link>

            <div className='hidden md:flex space-x-6'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
