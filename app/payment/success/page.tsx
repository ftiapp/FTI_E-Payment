import Link from 'next/link'

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            บันทึกข้อมูลสำเร็จ
          </h1>
          <p className="text-gray-600 mb-8">
            ข้อมูลการชำระเงินของท่านได้รับการบันทึกเรียบร้อยแล้ว
            <br />
            ท่านสามารถดำเนินการชำระเงินต่อได้ที่หน้านี้
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              ดำเนินการชำระเงิน
            </button>
            
            <Link 
              href="/payment"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              กลับหน้าแบบฟอร์ม
            </Link>
          </div>

          {/* Reference Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              หากมีข้อสงสัย กรุณาติดต่อฝ่ายบริการลูกค้า
              <br />
              CALL CENTER: 1453
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
