import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // authOptionsをインポート
import axios from 'axios';

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ✅ Next.js 15対応の完全修正版
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }  // ←Promise型に変更
) {
  try {
    // ✅ paramsをawaitで取得（Next.js 15の新仕様）
    const { userId } = await params;

    // ✅ authOptionsを明示的に渡す
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 管理者権限確認
    if (session.user.role !== 2) { // 2: admin
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // リクエストボディの解析
    const { role } = await request.json();

    // roleの値を検証
    if (!['general', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role value. Must be "general" or "admin"' },
        { status: 400 }
      );
    }

    // userIdの検証も追加
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // バックエンドでユーザーの権限を更新
    const response = await axios.patch(
      `${serverApiUrl}/api/v1/admin/users/${userId}/role`,
      { role },
      {
        headers: {
          'Authorization': `Bearer ${session.user.id}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // タイムアウト設定
      }
    );

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: response.data
    });

  } catch (error) {
    console.error('Role update error:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || 'Failed to update role';
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
