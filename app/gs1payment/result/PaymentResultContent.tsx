'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function GS1PaymentResultContent() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Get payment response from URL parameters
    const invoiceNo = searchParams.get('invoiceNo')
    const channelCode = searchParams.get('channelCode')
    const respCode = searchParams.get('respCode')
    const respDesc = searchParams.get('respDesc')

    const processPaymentResult = async () => {
      try {
        // Call payment inquiry to get full payment details
        if (invoiceNo) {
          const response = await fetch('/api/gs1payment/inquiry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ invoiceNo }),
          })

          const result = await response.json()

          if (result.success) {
            setPaymentDetails(result.data)
            
            // Determine payment status based on response code
            if (result.data.respCode === '0000') {
              setPaymentStatus('success')
            } else {
              setPaymentStatus('failed')
            }
          } else {
            // Fallback to frontend response if inquiry fails
            if (respCode === '2000') {
              setPaymentStatus('pending') // Transaction completed, need inquiry
            } else if (respCode === '1000' || respCode === '2001') {
              setPaymentStatus('failed')
            } else {
              setPaymentStatus('failed')
            }
          }
        }
      } catch (error) {
        console.error('Error processing GS1 payment result:', error)
        setPaymentStatus('failed')
      } finally {
        setIsProcessing(false)
      }
    }

    processPaymentResult()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              กำลังตรวจสอบสถานะการชำระเงิน
            </h1>
            <p className="text-gray-600">
              กรุณารอสักครู่...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {/* Status Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            paymentStatus === 'success' ? 'bg-green-100' : 
            paymentStatus === 'failed' ? 'bg-red-100' : 
            'bg-yellow-100'
          }`}>
            {paymentStatus === 'success' ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : paymentStatus === 'failed' ? (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
          </div>

          {/* Status Message */}
          <h1 className={`text-3xl font-bold mb-4 ${
            paymentStatus === 'success' ? 'text-green-600' : 
            paymentStatus === 'failed' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {paymentStatus === 'success' ? 'ชำระเงินสำเร็จ' :
             paymentStatus === 'failed' ? 'ชำระเงินไม่สำเร็จ' :
             'กำลังดำเนินการ'}
          </h1>

          <p className="text-gray-600 mb-8">
            {paymentStatus === 'success' ? 
              'การชำระเงินของท่านเสร็จสมบูรณ์แล้ว' :
              paymentStatus === 'failed' ?
              'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่' :
              'การชำระเงินอยู่ระหว่างดำเนินการ'
            }
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">รายละเอียดการชำระเงิน</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">เลขที่ใบแจ้งหนี้:</span>
                  <span className="font-medium">{paymentDetails.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนเงิน:</span>
                  <span className="font-medium">฿{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">หมายเลขอ้างอิง:</span>
                  <span className="font-medium">{paymentDetails.tranRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่ทำรายการ:</span>
                  <span className="font-medium">{paymentDetails.transactionDateTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {paymentStatus === 'success' && (
              <button className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                พิมพ์ใบเสร็จ
              </button>
            )}
            
            {paymentStatus === 'failed' && (
              <button 
                onClick={() => router.push('/gs1payment')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                ลองชำระเงินอีกครั้ง
              </button>
            )}
            
            <button 
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              กลับหน้าแรก
            </button>
          </div>

          {/* Contact Info */}
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
