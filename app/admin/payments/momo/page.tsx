'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'

interface MomoPayment {
  id: number
  orderId: string
  amount: number
  status: string
  payUrl: string
  message: string
  createdAt: string
}

interface Invoice {
  id: number
  finalAmount: number
  status: string
  booking: {
    id: number
    user: {
      fullName: string
    }
  }
}

export default function MomoPaymentPage() {
  const [momoPayments, setMomoPayments] = useState<MomoPayment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const { toast } = useToast()

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchMomoPayments()
    fetchInvoices()
  }, [])

  const fetchMomoPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments/momo/all')
      const data = await response.json()
      
      if (data.success) {
        setMomoPayments(data.data)
      }
    } catch (error) {
      console.error('Error fetching Momo payments:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        // Chỉ lấy các hóa đơn chưa thanh toán
        const unpaidInvoices = data.filter((invoice: Invoice) => 
          invoice.status === 'Pending' || invoice.status === 'Confirmed'
        )
        setInvoices(unpaidInvoices)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const createMomoPayment = async () => {
    if (!selectedInvoiceId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hóa đơn",
        variant: "destructive"
      })
      return
    }

    setIsCreatingPayment(true)
    try {
      const response = await fetch('/api/admin/payments/momo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: parseInt(selectedInvoiceId) })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã tạo thanh toán Momo thành công!"
        })
        
        // Refresh data
        fetchMomoPayments()
        setSelectedInvoiceId('')
        
        // Hiển thị thông tin thanh toán
        console.log('Payment URL:', data.payUrl)
        console.log('Order ID:', data.orderId)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo thanh toán",
        variant: "destructive"
      })
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const simulatePaymentSuccess = async (orderId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/payments/momo/simulate-success/${orderId}`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã mô phỏng thanh toán thành công!"
        })
        
        // Refresh data
        fetchMomoPayments()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/momo/status/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Trạng thái thanh toán",
          description: `Order ${orderId}: ${data.status} - ${data.message}`
        })
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ thanh toán</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Thành công</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Thất bại</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý Thanh toán Momo</h1>
        <p className="text-gray-600 mt-2">Môi trường test - Mô phỏng thanh toán Momo</p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Tạo thanh toán</TabsTrigger>
          <TabsTrigger value="list">Danh sách thanh toán</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Tạo thanh toán Momo mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoice-select">Chọn hóa đơn</Label>
                <select
                  id="invoice-select"
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      Hóa đơn #{invoice.id} - {invoice.booking.user.fullName} - {formatCurrency(invoice.finalAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={createMomoPayment} 
                disabled={isCreatingPayment || !selectedInvoiceId}
                className="w-full"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo thanh toán Momo'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thanh toán Momo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {momoPayments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có thanh toán nào</p>
                ) : (
                  momoPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Order ID: {payment.orderId}</h3>
                          <p className="text-sm text-gray-600">Số tiền: {formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-600">Thời gian: {formatDateTime(payment.createdAt)}</p>
                          {payment.message && (
                            <p className="text-sm text-gray-600">Tin nhắn: {payment.message}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => checkPaymentStatus(payment.orderId)}
                        >
                          Kiểm tra trạng thái
                        </Button>

                        {payment.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => simulatePaymentSuccess(payment.orderId)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : null}
                            Mô phỏng thanh toán thành công
                          </Button>
                        )}

                        {payment.payUrl && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(payment.payUrl, '_blank')}
                          >
                            Mở link thanh toán
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 