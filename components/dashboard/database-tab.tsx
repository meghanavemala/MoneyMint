/*
Database tab component for viewing customer overview, balances, and transaction history.
Provides detailed customer management with search, filtering, and transaction viewing capabilities.
*/

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Loader2,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  FileText,
  BarChart3,
  Users,
  Wallet,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
} from 'lucide-react';
import {
  getCustomersAction,
  getCustomerByIdAction,
  type CustomerWithTransactions,
  type CustomerWithBalance,
} from '@/actions/finance-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

type ViewMode = 'list' | 'details';

export function DatabaseTab() {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithTransactions | null>(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await getCustomersAction();
      if (result.isSuccess && result.data) {
        setCustomers(result.data);
      } else {
        toast.error(result.message || 'Failed to load customers');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('An error occurred while loading customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      setCustomerDetailsLoading(true);
      const result = await getCustomerByIdAction(customerId);
      if (result.isSuccess && result.data) {
        setSelectedCustomer(result.data);
        setViewMode('details');
      } else {
        toast.error(result.message || 'Failed to load customer details');
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      toast.error('An error occurred while loading customer details');
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  const handleDownloadPDF = async (customer: CustomerWithTransactions) => {
    try {
      const { generateCustomerPDF } = await import('@/lib/utils/pdf-generator');
      await generateCustomerPDF(customer, {
        businessName: 'MoneyMint',
        includeBalance: true,
      });
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);
  const totalCredit = customers.reduce((sum, customer) => sum + (customer.total_credit || 0), 0);
  const totalPaid = customers.reduce((sum, customer) => sum + (customer.total_paid || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedCustomer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('list');
                setSelectedCustomer(null);
              }}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Customers
            </Button>
            <div>
              <h3 className="text-2xl font-bold">{selectedCustomer.name}</h3>
              <p className="text-muted-foreground">Customer Details & Transaction History</p>
            </div>
          </div>
          <Button onClick={() => handleDownloadPDF(selectedCustomer)} className="ml-auto">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="size-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="font-medium">Address:</span>
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="flex items-center space-x-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium">Notes:</span>
                    <span>{selectedCustomer.notes}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Customer Since:</span>
                  <span>{format(new Date(selectedCustomer.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="size-5" />
                <span>Financial Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="size-4 text-red-600" />
                    <span className="font-medium text-red-700 dark:text-red-300">Total Credit</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(selectedCustomer.total_credit || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="size-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      Total Paid
                    </span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedCustomer.total_paid || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="size-4 text-blue-600" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Outstanding Balance
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(selectedCustomer.balance || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="size-5" />
              <span>Transaction History</span>
            </CardTitle>
            <CardDescription>
              Complete history of all transactions for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCustomer.transactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions found for this customer
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCustomer.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'CREDIT' ? 'destructive' : 'default'}
                          className={
                            transaction.type === 'CREDIT'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }
                        >
                          {transaction.type === 'CREDIT' ? 'Credit Given' : 'Payment Received'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === 'CREDIT'
                              ? 'font-semibold text-red-600'
                              : 'font-semibold text-green-600'
                          }
                        >
                          {transaction.type === 'CREDIT' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.description || 'No description'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Cards */}
      <div className="flex w-full justify-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
          <Card className="mx-auto flex aspect-square max-w-[180px] flex-col justify-between rounded-xl p-2 shadow-md sm:max-w-[200px] md:max-w-[220px] md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs font-semibold md:text-sm">Total Outstanding</CardTitle>
              <IndianRupee className="size-3 text-muted-foreground md:size-4" />
            </CardHeader>
            <CardContent className="pb-2 md:pb-4">
              <div className="text-base font-bold text-red-600 md:text-lg lg:text-xl">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Amount to be collected from all customers
              </p>
            </CardContent>
          </Card>
          <Card className="mx-auto flex aspect-square max-w-[180px] flex-col justify-between rounded-xl p-2 shadow-md sm:max-w-[200px] md:max-w-[220px] md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs font-semibold md:text-sm">Total Credit Given</CardTitle>
              <TrendingUp className="size-3 text-muted-foreground md:size-4" />
            </CardHeader>
            <CardContent className="pb-2 md:pb-4">
              <div className="text-base font-bold md:text-lg lg:text-xl">
                {formatCurrency(totalCredit)}
              </div>
              <p className="text-xs text-muted-foreground">Total amount lent to customers</p>
            </CardContent>
          </Card>
          <Card className="mx-auto flex aspect-square max-w-[180px] flex-col justify-between rounded-xl p-2 shadow-md sm:max-w-[200px] md:max-w-[220px] md:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs font-semibold md:text-sm">Total Collected</CardTitle>
              <TrendingDown className="size-3 text-muted-foreground md:size-4" />
            </CardHeader>
            <CardContent className="pb-2 md:pb-4">
              <div className="text-base font-bold text-green-600 md:text-lg lg:text-xl">
                {formatCurrency(totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">Total payments received</p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Customer List */}
      <Card className="mb-4 rounded-xl shadow-md md:mb-8">
        <CardHeader className="pb-2 md:pb-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-sm font-semibold md:text-base lg:text-lg">
                Customer Database
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage your customers and view their transaction history
              </CardDescription>
            </div>
            <div className="flex w-full items-center sm:w-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg pl-10 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2 md:pb-4">
          {filteredCustomers.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground md:py-8 md:text-sm">
              {searchTerm
                ? 'No customers found matching your search'
                : 'No customers found. Add your first customer in the Add Entry tab.'}
            </div>
          ) : (
            <div className="-mx-2 overflow-x-auto sm:mx-0">
              <Table className="min-w-[600px] text-xs md:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-2 md:px-4">Customer</TableHead>
                    <TableHead className="p-2 md:px-4">Contact</TableHead>
                    <TableHead className="p-2 md:px-4">Credit Given</TableHead>
                    <TableHead className="p-2 md:px-4">Paid</TableHead>
                    <TableHead className="p-2 md:px-4">Balance</TableHead>
                    <TableHead className="p-2 md:px-4">Status</TableHead>
                    <TableHead className="p-2 md:px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="p-2 md:px-4">
                        <div>
                          <div className="text-xs font-medium md:text-sm lg:text-base">
                            {customer.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Since {format(new Date(customer.created_at), 'MMM yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Phone className="size-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Mail className="size-3" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <span className="text-xs font-medium text-red-600 md:text-sm">
                          {formatCurrency(customer.total_credit || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <span className="text-xs font-medium text-green-600 md:text-sm">
                          {formatCurrency(customer.total_paid || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <span
                          className={`text-xs font-bold md:text-sm ${(customer.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {formatCurrency(customer.balance || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <Badge
                          variant={customer.is_active ? 'default' : 'secondary'}
                          className="rounded-full px-2 py-1 text-xs md:text-sm"
                        >
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 md:px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto rounded-lg px-2 py-1 text-xs md:text-sm"
                          onClick={() => loadCustomerDetails(customer.id)}
                          disabled={customerDetailsLoading}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
