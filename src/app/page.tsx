'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToastContext } from './context/ToastContext';

function LoginSuccessHandler() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { showSuccess } = useToastContext();

	useEffect(() => {
		// ログイン成功後のクエリパラメータをチェック
		if (searchParams.get('login') === 'success') {
			showSuccess('ようこそ！ログインしました。', 4000);
			// URLからクエリパラメータを削除
			const url = new URL(window.location.href);
			url.searchParams.delete('login');
			router.replace(url.pathname, { scroll: false });
		}
	}, [searchParams, showSuccess, router]);

	return null;
}

export default function Home() {
	const { status } = useSession();

	return (
		<div className="bg-gray-50">
			<Suspense fallback={null}>
				<LoginSuccessHandler />
			</Suspense>
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* ヒーローセクション */}
				<div className="w-full text-center py-16 bg-gradient-to-r rounded-lg mb-12">
					<h1 className="text-4xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-4">
						<i className="fas fa-seedling text-6xl text-green-500"></i>
						<span>とくたびログ</span>
						<i className="fas fa-suitcase text-6xl text-blue-600"></i>
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						誰かの定番が誰かの特別な旅行に
					</p>
					<p className="text-lg text-gray-700 mb-8">
						とくたびログは、あなたの旅行体験を記録し、思い出を振り返るとともに次の旅行プランニングをサポートするサービスです。
					</p>
					
					{status === 'authenticated' ? (
						<Link
							href="/travel-record/new"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-300 shadow-lg hover:shadow-xl bg-orange-500 hover:bg-orange-600"
						>
							<i className="fas fa-plus mr-2"></i>
							旅行記録を作成する
						</Link>
					) : (
						<Link
							href="/auth/login"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-300 shadow-lg hover:shadow-xl bg-orange-500 hover:bg-orange-600"
						>
							<i className="fas fa-sign-in-alt mr-2"></i>
							ログイン・新規登録
						</Link>
					)}
				</div>

				{/* 機能紹介セクション */}
				<div className="w-full mb-12">
					<div className="w-full block">
						<div className="w-full p-6 bg-white rounded-lg shadow-md mb-8 block">
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 mb-4 bg-pink-100 rounded-full flex items-center justify-center">
									<i className="fas fa-map-marked-alt text-2xl text-pink-600"></i>
								</div>
								<p className="text-gray-600 leading-relaxed mb-6">
									旅行記録を残そう！<br /><br />
									いつ、どこに、誰と旅行したのかを<br />
									詳細に記録することができます
								</p>
								{status === 'authenticated' ? (
									<Link
										href="/travel-record/new"
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md bg-orange-500 hover:bg-orange-600"
									>
										<i className="fas fa-plus mr-2"></i>
										記録する！
									</Link>
								) : (
									<Link
										href="/auth/login"
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md bg-orange-500 hover:bg-orange-600"
									>
										<i className="fas fa-sign-in-alt mr-2"></i>
										記録する！
									</Link>
								)}
							</div>
						</div>

						<div className="w-full p-6 bg-white rounded-lg shadow-md mb-8 block">
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
									<i className="fas fa-users text-2xl text-blue-600"></i>
								</div>
								<p className="text-gray-600 leading-relaxed mb-6">
									同行者の情報を管理しよう！<br /><br />
									旅行の同行者を登録することで、同行者ごとに記録を見ることができます。<br />
									また、好みを登録しておくことで、より楽しい旅行プランニングが可能です
								</p>
								{status === 'authenticated' ? (
									<Link
										href="/companions/new"
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md bg-orange-500 hover:bg-orange-600"
									>
										<i className="fas fa-user-plus mr-2"></i>
										登録する！
									</Link>
								) : (
									<Link
										href="/auth/login"
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md bg-orange-500 hover:bg-orange-600"
									>
										<i className="fas fa-sign-in-alt mr-2"></i>
										登録する！
									</Link>
								)}
							</div>
						</div>

						<div className="w-full p-6 bg-white rounded-lg shadow-md mb-8 block">
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 mb-4 bg-purple-100 rounded-full flex items-center justify-center">
									<i className="fas fa-chart-line text-2xl text-purple-600"></i>
								</div>
								<p className="text-gray-600 leading-relaxed mb-6">
									みんなの旅行記録を見に行こう！<br /><br />
									記録した旅行体験を公開できます。<br />
									次の旅行先を迷った際にあっと驚くようなアイデアが見つかるかも
								</p>
								<Link
									href="/travel-records"
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md bg-orange-500 hover:bg-orange-600"
								>
									<i className="fas fa-eye mr-2"></i>
									見に行く！
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
