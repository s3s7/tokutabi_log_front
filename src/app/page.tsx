// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToastContext } from './context/ToastContext';

export default function Home() {
	const { status } = useSession();
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

	return (
		<div className="bg-gray-50">
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
