import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// ユーザーデータを読み込み
async function readUsers() {
  try {
    if (!existsSync(USERS_FILE)) {
      return [];
    }
    const data = await readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// 認証トークン生成
function generateAuthToken(email: string) {
  return btoa(JSON.stringify({
    email: email,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間
  }));
}

// POST: ユーザーログイン
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 入力値検証
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '正しいメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // デモアカウントチェック
    if (email === 'demo@fortplan.com' && password === 'password123') {
      const demoUser = {
        id: 'demo-user-001',
        email: 'demo@fortplan.com',
        teamName: 'Demo Team',
        representativeName: 'デモユーザー',
        password: btoa('password123'),
        isPaid: true,
        createdAt: new Date().toISOString()
      };

      const authToken = generateAuthToken(email);

      return NextResponse.json({
        success: true,
        user: demoUser,
        token: authToken,
        message: 'ログインに成功しました'
      });
    }

    // サーバーサイドのユーザーデータから検索
    const users = await readUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'アカウントが見つかりません。新規登録を行ってください。' },
        { status: 404 }
      );
    }

    // パスワード検証
    let isPasswordValid = false;
    
    if (user.password) {
      try {
        const decodedPassword = atob(user.password);
        isPasswordValid = decodedPassword === password;
      } catch (error) {
        console.error('Password decode error:', error);
        isPasswordValid = false;
      }
    } else {
      // 旧ユーザー（パスワードなし）の場合
      isPasswordValid = password.length >= 6;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    // ログイン成功
    const authToken = generateAuthToken(email);

    // ログイン履歴更新（オプション）
    user.lastLoginAt = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;

    return NextResponse.json({
      success: true,
      user: user,
      token: authToken,
      message: 'ログインに成功しました'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました。しばらく経ってから再度お試しください。' },
      { status: 500 }
    );
  }
} 