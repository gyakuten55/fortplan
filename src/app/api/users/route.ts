import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// データディレクトリが存在しない場合は作成
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// ユーザーデータを読み込み
async function readUsers() {
  try {
    await ensureDataDir();
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

// ユーザーデータを保存
async function writeUsers(users: any[]) {
  try {
    await ensureDataDir();
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

// GET: 全ユーザー取得
export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新規ユーザー登録
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // 必須フィールドの検証
    if (!userData.email || !userData.teamName || !userData.representativeName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const users = await readUsers();
    
    // 既存ユーザーチェック
    const existingUser = users.find((user: any) => user.email === userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: '既に登録済みのメールアドレスです' },
        { status: 409 }
      );
    }

    // 新規ユーザー作成
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email,
      teamName: userData.teamName,
      representativeName: userData.representativeName,
      password: userData.password, // Base64エンコード済み
      isPaid: userData.isPaid || true,
      sessionId: userData.sessionId, // Stripeセッション情報
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: null,
      loginCount: 0
    };

    users.push(newUser);
    
    const success = await writeUsers(users);
    if (!success) {
      return NextResponse.json(
        { error: 'ユーザー情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'ユーザー登録が完了しました'
    });

  } catch (error) {
    console.error('POST users error:', error);
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ユーザー削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが指定されていません' },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const filteredUsers = users.filter((user: any) => user.email !== email);
    
    if (users.length === filteredUsers.length) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const success = await writeUsers(filteredUsers);
    if (!success) {
      return NextResponse.json(
        { error: 'ユーザー削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ユーザーを削除しました'
    });

  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json(
      { error: 'ユーザー削除に失敗しました' },
      { status: 500 }
    );
  }
} 