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
      <div className="space-y-4 md:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('list');
                setSelectedCustomer(null);
              }}
              className="w-fit"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Customers
            </Button>
            <div className="sm:ml-4">
              <h3 className="text-xl font-bold sm:text-2xl">{selectedCustomer.name}</h3>
              <p className="text-sm text-muted-foreground">
                Customer Details & Transaction History
              </p>
            </div>
          </div>
          <Button onClick={() => handleDownloadPDF(selectedCustomer)} className="w-fit sm:ml-auto">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <User className="size-4 md:size-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start space-x-2">
                  <User className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                  <div className="flex-1">
                    <span className="text-xs font-medium md:text-sm">Name:</span>
                    <div className="text-sm md:text-base">{selectedCustomer.name}</div>
                  </div>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                    <div className="flex-1">
                      <span className="text-xs font-medium md:text-sm">Phone:</span>
                      <div className="text-sm md:text-base">{selectedCustomer.phone}</div>
                    </div>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-start space-x-2">
                    <Mail className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                    <div className="flex-1">
                      <span className="text-xs font-medium md:text-sm">Email:</span>
                      <div className="break-all text-sm md:text-base">{selectedCustomer.email}</div>
                    </div>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                    <div className="flex-1">
                      <span className="text-xs font-medium md:text-sm">Address:</span>
                      <div className="text-sm md:text-base">{selectedCustomer.address}</div>
                    </div>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="flex items-start space-x-2">
                    <FileText className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                    <div className="flex-1">
                      <span className="text-xs font-medium md:text-sm">Notes:</span>
                      <div className="text-sm md:text-base">{selectedCustomer.notes}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-2">
                  <Calendar className="mt-0.5 size-3 text-muted-foreground md:size-4" />
                  <div className="flex-1">
                    <span className="text-xs font-medium md:text-sm">Customer Since:</span>
                    <div className="text-sm md:text-base">
                      {format(new Date(selectedCustomer.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary Card */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <IndianRupee className="size-4 md:size-5" />
                <span>Financial Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="grid gap-3 md:gap-4">
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="size-3 text-red-600 md:size-4" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-300 md:text-sm">
                      Total Credit
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-600 md:text-xl">
                    {formatCurrency(selectedCustomer.total_credit || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="size-3 text-green-600 md:size-4" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300 md:text-sm">
                      Total Paid
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600 md:text-xl">
                    {formatCurrency(selectedCustomer.total_paid || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="size-3 text-blue-600 md:size-4" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 md:text-sm">
                      Outstanding Balance
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 md:text-xl">
                    {formatCurrency(selectedCustomer.balance || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Clock className="size-4 md:size-5" />
              <span>Transaction History</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Complete history of all transactions for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCustomer.transactions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground md:py-8">
                No transactions found for this customer
              </div>
            ) : (
              <div className="-mx-2 overflow-x-auto sm:mx-0">
                <Table className="min-w-[600px] text-xs md:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-2 md:px-4">Date</TableHead>
                      <TableHead className="p-2 md:px-4">Type</TableHead>
                      <TableHead className="p-2 md:px-4">Amount</TableHead>
                      <TableHead className="p-2 md:px-4">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCustomer.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="p-2 md:px-4">
                          {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="p-2 md:px-4">
                          <Badge
                            variant={transaction.type === 'CREDIT' ? 'destructive' : 'default'}
                            className="text-xs md:text-sm"
                          >
                            {transaction.type === 'CREDIT' ? 'Credit Given' : 'Payment Received'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2 md:px-4">
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
                        <TableCell className="p-2 text-muted-foreground md:px-4">
                          {transaction.description || 'No description'}
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
