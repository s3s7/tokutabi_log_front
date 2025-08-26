'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { status, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 shadow-md z-10" style={{ backgroundColor: '#B0E0E6' }}>
      <div className="mx-auto pl-2 pr-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900 text-left -ml-2">
          <Link href="/" className="flex items-center gap-0 hover:text-gray-700 transition-colors duration-200">
            <span>とくたびログ</span>
          </Link>
        </div>

        <div className="relative">
          <button
            id="menu-toggle"
            className="focus:outline-none p-2"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border" style={{ zIndex: 9999 }}>
              {status === 'authenticated' ? (
                <>
                  <Link href="/mypage" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                    マイページ
                  </Link>
                  <Link href="/travel-record/new" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                    旅行記録を追加
                  </Link>
                  <Link href="/companions/new" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                    同行者を追加
                  </Link>
                  
                  {/* 管理者専用メニュー */}
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">管理者メニュー</p>
                      </div>
                      <Link href="/admin" className="block px-4 py-2 text-red-800 hover:bg-red-50" onClick={closeMenu}>
                        <i className="fas fa-cog mr-2"></i>
                        管理者画面
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => {
                      closeMenu();
                      if (confirm('ログアウトしますか？')) {
                        signOut({ callbackUrl: '/' });
                      }
                    }}
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                  ログイン/新規登録
                </Link>
              )}
              <Link href="/travel-records" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                みんなの旅行記録
              </Link>
              {status === 'authenticated' && (
                <Link href="/companions" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                  同行者一覧
                </Link>
              )}
              
              <div className="border-t border-gray-200 my-2"></div>
              
              <Link href="/how-to-use" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                使い方
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}