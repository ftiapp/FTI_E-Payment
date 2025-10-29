'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CustomerType = 'corporate' | 'personal'
type Language = 'th' | 'en'

interface FormData {
  // Section 1: Tax Invoice Information
  invoiceNumber: string
  ftiMemberId: string
  taxId: string
  othersReference: string
  
  // Section 2: Company/Personal Information
  companyName: string
  firstName: string
  lastName: string
  
  // Section 3: Contact & Payment Information
  phone: string
  email: string
  address: string
  serviceOrProduct: string
  totalAmount: string
}

const translations = {
  th: {
    title: 'FTI E-Payment',
    subtitle: 'ระบบชำระเงินออนไลน์',
    
    // Customer Type
    customerTypeTitle: 'ต้องการออกใบกำกับภาษีในนามของ',
    corporate: 'นิติบุคคล / Corporate',
    personal: 'บุคคล / Personal',
    
    // Section Titles
    section1Title: 'ส่วนที่ 1: ข้อมูลใบกำกับภาษี',
    section2Title: 'ส่วนที่ 2: ข้อมูลบริษัท/บุคคล',
    section3Title: 'ส่วนที่ 3: ข้อมูลติดต่อและการชำระเงิน',
    
    // Section 1 Fields
    invoiceNumber: 'เลขใบแจ้งหนี้ / Invoice Number',
    ftiMemberId: 'เลขที่สมาชิก สอท. / FTI Member ID',
    taxId: 'เลขผู้เสียภาษี / Tax ID',
    othersReference: 'ข้อมูลอ้างอิงอื่นๆ / Others Reference',
    
    // Section 2 Fields
    companyName: 'ชื่อบริษัท / Company Name',
    firstName: 'ชื่อ / First Name',
    lastName: 'นามสกุล / Last Name',
    
    // Section 3 Fields
    phone: 'เบอร์โทรศัพท์ / Phone',
    email: 'อีเมล / Email',
    address: 'ที่อยู่ / Address',
    serviceOrProduct: 'บริการหรือสินค้า / Service or Product',
    totalAmount: 'จำนวนเงินที่ต้องชำระ (บาท) / Total Amount (THB)',
    
    // Buttons & Messages
    submit: 'ดำเนินการชำระเงิน',
    required: 'กรุณากรอกข้อมูล',
    invalidEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
    invalidPhone: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)'
  },
  en: {
    title: 'FTI E-Payment',
    subtitle: 'Online Payment System',
    
    // Customer Type
    customerTypeTitle: 'Issue Tax Invoice For',
    corporate: 'Corporate / นิติบุคคล',
    personal: 'Personal / บุคคล',
    
    // Section Titles
    section1Title: 'Section 1: Tax Invoice Information',
    section2Title: 'Section 2: Company/Personal Information',
    section3Title: 'Section 3: Contact & Payment Information',
    
    // Section 1 Fields
    invoiceNumber: 'Invoice Number / เลขใบแจ้งหนี้',
    ftiMemberId: 'FTI Member ID / เลขที่สมาชิก สอท.',
    taxId: 'Tax ID / เลขผู้เสียภาษี',
    othersReference: 'Others Reference / ข้อมูลอ้างอิงอื่นๆ',
    
    // Section 2 Fields
    companyName: 'Company Name / ชื่อบริษัท',
    firstName: 'First Name / ชื่อ',
    lastName: 'Last Name / นามสกุล',
    
    // Section 3 Fields
    phone: 'Phone / เบอร์โทรศัพท์',
    email: 'Email / อีเมล',
    address: 'Address / ที่อยู่',
    serviceOrProduct: 'Service or Product / บริการหรือสินค้า',
    totalAmount: 'Total Amount (THB) / จำนวนเงินที่ต้องชำระ (บาท)',
    
    // Buttons & Messages
    submit: 'Proceed to Payment',
    required: 'This field is required',
    invalidEmail: 'Invalid email format',
    invalidPhone: 'Invalid phone number (9-10 digits)'
  }
}

export default function PaymentPage() {
  const [customerType, setCustomerType] = useState<CustomerType>('corporate')
  const [language, setLanguage] = useState<Language>('th')
  const [formData, setFormData] = useState<FormData>({
    invoiceNumber: '',
    ftiMemberId: '',
    taxId: '',
    othersReference: '',
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    serviceOrProduct: '',
    totalAmount: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const t = translations[language]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Section 1 - Required
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = t.required
    
    // Section 2 - Required based on customer type
    if (customerType === 'corporate') {
      if (!formData.companyName.trim()) newErrors.companyName = t.required
    } else {
      if (!formData.firstName.trim()) newErrors.firstName = t.required
      if (!formData.lastName.trim()) newErrors.lastName = t.required
    }

    // Section 3 - Required
    if (!formData.address.trim()) newErrors.address = t.required
    if (!formData.serviceOrProduct.trim()) newErrors.serviceOrProduct = t.required
    if (!formData.totalAmount.trim()) newErrors.totalAmount = t.required

    // Optional field validations
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail
    }

    if (formData.phone && !/^[0-9]{9,10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = t.invalidPhone
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Generate unique invoice number for both database and 2C2P
      const timestamp = Date.now()
      const uniqueInvoiceNumber = `${formData.invoiceNumber}-${timestamp}`
      
      // Prepare data for database insertion
      const paymentData = {
        customer_type: customerType,
        invoice_number: uniqueInvoiceNumber, // Store unique invoice in DB
        original_invoice_number: formData.invoiceNumber, // Keep original for reference
        fti_member_id: formData.ftiMemberId || null,
        tax_id: formData.taxId || null,
        others_reference: formData.othersReference || null,
        company_name: customerType === 'corporate' ? formData.companyName : null,
        first_name: customerType === 'personal' ? formData.firstName : null,
        last_name: customerType === 'personal' ? formData.lastName : null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address,
        service_or_product: formData.serviceOrProduct,
        total_amount: parseFloat(formData.totalAmount),
        created_at: new Date().toISOString()
      }

      console.log('📝 Creating payment with unique invoice:', {
        unique: uniqueInvoiceNumber,
        original: formData.invoiceNumber
      })

      // Insert into database
      const dbResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!dbResponse.ok) {
        throw new Error('Failed to save payment data')
      }

      // Get 2C2P payment token using unique invoice number (with timestamp)
      const tokenResponse = await fetch('/api/payment/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNo: uniqueInvoiceNumber, // Send unique invoice to 2C2P to match database
          amount: parseFloat(formData.totalAmount),
          description: formData.serviceOrProduct
        }),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenData.success) {
        throw new Error('Failed to get payment token: ' + (tokenData.error || 'Unknown error'))
      }

      // Redirect to 2C2P payment page
      window.location.href = tokenData.webPaymentUrl
      
    } catch (error) {
      console.error('Payment processing error:', error)
      
      // Handle specific error scenarios
      let errorMessage = 'เกิดข้อผิดพลาดในการดำเนินการชำระเงิน กรุณาลองใหม่อีกครั้ง'
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to save payment data')) {
          errorMessage = 'ไม่สามารถบันทึกข้อมูลการชำระเงินได้ กรุณาติดต่อผู้ดูแลระบบ'
        } else if (error.message.includes('Failed to get payment token')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับระบบชำระเงินได้ กรุณาลองใหม่อีกครั้ง'
        } else if (error.message.includes('2C2P')) {
          errorMessage = 'ระบบชำระเงินมีปัญหาชั่วคราว กรุณาลองใหม่ภายหลัง'
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-blue-900">{t.title}</h1>
              <p className="text-gray-600 mt-2">{t.subtitle}</p>
            </div>
            
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('th')}
                className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  language === 'th'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ไทย
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Type Selection */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t.customerTypeTitle}
            </h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 px-6 py-4 rounded-lg border-2 border-transparent transition-all">
                <input
                  type="radio"
                  name="customerType"
                  value="corporate"
                  checked={customerType === 'corporate'}
                  onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                  className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800 font-medium">{t.corporate}</span>
              </label>
              <label className="flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 px-6 py-4 rounded-lg border-2 border-transparent transition-all">
                <input
                  type="radio"
                  name="customerType"
                  value="personal"
                  checked={customerType === 'personal'}
                  onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                  className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800 font-medium">{t.personal}</span>
              </label>
            </div>
          </div>

          {/* Section 1: Tax Invoice Information */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t.section1Title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.invoiceNumber} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.invoiceNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.invoiceNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.ftiMemberId}
                </label>
                <input
                  type="text"
                  value={formData.ftiMemberId}
                  onChange={(e) => handleInputChange('ftiMemberId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.taxId}
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.othersReference}
                </label>
                <input
                  type="text"
                  value={formData.othersReference}
                  onChange={(e) => handleInputChange('othersReference', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Section 2: Company/Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t.section2Title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customerType === 'corporate' ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.companyName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder=""
                  />
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.firstName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder=""
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.lastName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder=""
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Contact & Payment Information */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t.section3Title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.address} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.serviceOrProduct} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.serviceOrProduct}
                  onChange={(e) => handleInputChange('serviceOrProduct', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.serviceOrProduct ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.serviceOrProduct && (
                  <p className="mt-2 text-sm text-red-600">{errors.serviceOrProduct}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.totalAmount} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=""
                />
                {errors.totalAmount && (
                  <p className="mt-2 text-sm text-red-600">{errors.totalAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pb-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-12 py-4 text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">กำลังนำท่านไปสู่หน้าชำระเงิน</h3>
              <p className="text-gray-600">กรุณาอย่าปิดหน้าต่างนี้</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}