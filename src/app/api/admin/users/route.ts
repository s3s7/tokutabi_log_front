import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import axios from 'axios';

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 拡張されたセッションユーザーの型アサーション
    const user = session.user as { id: string; role: number };

    // 管理者権限確認（セッションにroleが含まれていることを想定）
    if (user.role !== 2) { // 2: admin
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // バックエンドからユーザー一覧を取得
    const response = await axios.get(`${serverApiUrl}/api/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${user.id}`,
      },
    });

    return NextResponse.json({ users: response.data });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}