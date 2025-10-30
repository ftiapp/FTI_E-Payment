import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* FTI Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/FTI-MasterLogo_RGB-White.png"
                alt="FTI - Federation of Thai Industries"
                width={140}
                height={36}
                priority
              />
             
            </div>
            <div className="space-y-2 text-gray-300">
              <p className="text-sm">
                ชั้น 7 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์<br/>
                เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ<br/>
                เขตสาทร กรุงเทพมหานคร 10120
              </p>
              <p className="text-sm">
                <strong>CALL CENTER:</strong> 1453 <br/>
                
              </p>
            </div>
          </div>

          

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ติดตามเรา</h4>
            <div className="flex space-x-3">
              {/* Facebook */}
              <a href="https://www.facebook.com/TheFederationOfThaiIndustries" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="https://x.com/ftithailand" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@ftithailandchannel" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* LINE */}
              <a href="https://page.line.me/sjw1724h" target="_blank" rel="noopener noreferrer" aria-label="LINE" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.5 2 2 6.33 2 11.5c0 2.3 1.02 4.38 2.62 5.92l-.02.23.03 1.37.01.82c0 .56.6.93 1.12.72l1.5-.6.45-.18c1.3.48 2.71.74 4.21.74 5.5 0 10-4.33 10-9.5S17.5 2 12 2zm-2.5 8.25h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
          <p className="mt-2">ฝ่ายดิจิทัลและเทคโนโลยีสารสนเทศ สภาอุตสาหกรรมแห่งประเทศไทย</p>
          <p className="mt-2">หากท่านติดปัญหาด้านการใช้งาน กรุณาติดต่อ พลวัต ศรีชนะ 02-345-1075</p>
        </div>
      </div>
    </footer>
  )
}
