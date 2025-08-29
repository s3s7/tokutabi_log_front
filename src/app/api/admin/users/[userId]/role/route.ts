import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import axios from 'axios';

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // セッション確認
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 管理者権限確認
    if (session.user.role !== 2) { // 2: admin
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId } = params;
    const { role } = await request.json();

    // roleの値を検証
    if (!['general', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role value' },
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
      }
    );

    return NextResponse.json({ 
      success: true, 
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