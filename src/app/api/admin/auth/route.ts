import { NextRequest, NextResponse } from 'next/server';

// 管理者認証情報（本格運用時は環境変数やデータベースで管理）
const ADMIN_CREDENTIALS = {
  username: 'fortplan-admin',
  password: 'FortPlan2024!Admin'  // 強力なパスワード
};

// 認証トークン生成
function generateAdminToken() {
  return btoa(JSON.stringify({
    type: 'admin',
    username: ADMIN_CREDENTIALS.username,
    timestamp: Date.now(),
    expires: Date.now() + (8 * 60 * 60 * 1000) // 8時間有効
  }));
}

// POST: 管理者ログイン
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 入力値検証
    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    }

    // 認証チェック
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: '認証に失敗しました。ユーザー名またはパスワードが正しくありません。' },
        { status: 401 }
      );
    }

    // 認証成功
    const token = generateAdminToken();
    const adminUser = {
      username: ADMIN_CREDENTIALS.username,
      role: 'admin',
      loginTime: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      token: token,
      admin: adminUser,
      message: '管理者ログインに成功しました'
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: '認証処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}

// GET: トークン検証
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    try {
      const tokenData = JSON.parse(atob(token));
      
      // トークンの有効性チェック
      if (tokenData.type !== 'admin' || 
          tokenData.username !== ADMIN_CREDENTIALS.username ||
          Date.now() > tokenData.expires) {
        return NextResponse.json(
          { error: '無効な認証トークンです' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        admin: {
          username: tokenData.username,
          role: 'admin'
        }
      });

    } catch (decodeError) {
      return NextResponse.json(
        { error: '不正な認証トークンです' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'トークン検証でエラーが発生しました' },
      { status: 500 }
    );
  }
} 