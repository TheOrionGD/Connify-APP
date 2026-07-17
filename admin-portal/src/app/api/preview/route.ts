import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const screen = searchParams.get('screen');

    if (!screen) {
      return NextResponse.json({ error: 'Screen parameter is required' }, { status: 400 });
    }

    // Sanitize input to prevent directory traversal
    const cleanScreen = screen.replace(/[^a-zA-Z0-9_\-]/g, '');

    // Resolve absolute path to o:\PROJECTS\CONNIFY-APP\App UI
    const workspaceRoot = path.resolve(process.cwd(), '..');
    const filePath = path.join(workspaceRoot, 'App UI', cleanScreen, 'code.html');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `HTML prototype replica file not found at: ${filePath}` },
        { status: 404 }
      );
    }

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
