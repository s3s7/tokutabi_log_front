import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 px-4 mt-12 w-full" style={{ backgroundColor: '#B0E0E6' }}>
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-row flex-wrap justify-center items-center space-x-2 sm:space-x-4 md:space-x-6 mb-6 text-center">
          <Link 
            href="/terms"
            className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm md:text-base font-medium transition-colors duration-200 hover:underline py-2 px-1"
          >
            利用規約
          </Link>
          <span className="text-gray-500 text-xs sm:text-sm">|</span>
          <Link 
            href="/privacy"
            className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm md:text-base font-medium transition-colors duration-200 hover:underline py-2 px-1"
          >
            プライバシーポリシー
          </Link>
          <span className="text-gray-500 text-xs sm:text-sm">|</span>
          <Link 
            href="/contact"
            className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm md:text-base font-medium transition-colors duration-200 hover:underline py-2 px-1"
          >
            お問い合わせ
          </Link>
        </div>
        
        <div className="flex justify-center items-center text-center border-t pt-4" style={{ borderColor: '#A0D8E8' }}>
          <p className="text-gray-600 font-medium text-xs md:text-sm">
            Copyright © 2025 とくたびログ
          </p>
        </div>
      </div>
    </footer>
  );
}