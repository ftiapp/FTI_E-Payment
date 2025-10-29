'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/FTI-MasterLogo_RGB-White.png"
              alt="FTI - Federation of Thai Industries"
              width={140}
              height={36}
              priority
            />
            <div>
              <h1 className="text-xl font-bold">สภาอุตสาหกรรมแห่งประเทศไทย</h1>
              <p className="text-xs text-blue-200">FEDERATION OF THAI INDUSTRIES</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="https://www.fti.or.th/AboutUs/background" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">เกี่ยวกับเรา</a>
            <a href="https://www.fti.or.th/Serve/certification" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">บริการ</a>
            <a href="https://www.fti.or.th/Articles/list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">ข่าวสาร</a>
            <a href="https://www.fti.or.th/ContactUs/contactchannel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">ติดต่อเรา</a>
            <Link 
              href="/payment" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ชำระเงิน
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-blue-800">
            <div className="flex flex-col space-y-3">
              <a href="https://www.fti.or.th/AboutUs/background" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">เกี่ยวกับเรา</a>
              <a href="https://www.fti.or.th/Serve/certification" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">บริการ</a>
              <a href="https://www.fti.or.th/Articles/list" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">ข่าวสาร</a>
              <a href="https://www.fti.or.th/ContactUs/contactchannel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">ติดต่อเรา</a>
              <Link 
                href="/payment" 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors text-center"
              >
                ชำระเงิน
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
