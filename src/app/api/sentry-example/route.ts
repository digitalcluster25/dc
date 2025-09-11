import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Пример ошибки для тестирования Sentry
    throw new Error('This is a test error for Sentry monitoring');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Логируем пользовательское действие
    Sentry.addBreadcrumb({
      message: 'User action performed',
      category: 'user-action',
      data: { action: body.action },
    });

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
