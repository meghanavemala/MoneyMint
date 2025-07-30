/*
Daily collection tab component for viewing daily transactions with calendar navigation.
Provides color-coded transactions, date filtering, and transaction summaries.
*/

'use client';

import { useState, useEffect } from 'react';
import { format, subDays, isToday, isYesterday, isSameDay } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Loader2,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { getDailyCollectionsAction } from '@/actions/finance-actions';

type DailyTransaction = {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  type: 'CREDIT' | 'PAYMENT';
  description: string | null;
  transaction_date: string;
};

type DailyCollectionData = {
  date: Date;
  totalCollection: number;
  transactions: DailyTransaction[];
};

export function DailyCollectionTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState<DailyCollectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'PAYMENT'>('ALL');

  useEffect(() => {
    loadDailyData(selectedDate);
  }, [selectedDate]);

  const loadDailyData = async (date: Date) => {
    try {
      setLoading(true);
      const result = await getDailyCollectionsAction(date);
      if (result.isSuccess && result.data) {
        setDailyData(result.data);
      } else {
        toast.error(result.message || 'Failed to load daily data');
        setDailyData({
          date,
          totalCollection: 0,
          transactions: [],
        });
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
      toast.error('An error occurred while loading daily data');
      setDailyData({
        date,
        totalCollection: 0,
        transactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleDownloadPDF = async () => {
    if (!dailyData) return;

    try {
      const { generateDailyCollectionPDF } = await import('@/lib/utils/pdf-generator');
      await generateDailyCollectionPDF(
        dailyData.date,
        dailyData.transactions,
        dailyData.totalCollection,
        {
          businessName: 'MoneyMint',
        }
      );
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM dd, yyyy');
  };

  const getQuickDateOptions = () => [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: subDays(new Date(), 1) },
    { label: '2 days ago', date: subDays(new Date(), 2) },
    { label: '3 days ago', date: subDays(new Date(), 3) },
    { label: '1 week ago', date: subDays(new Date(), 7) },
  ];

  const filteredTransactions =
    dailyData?.transactions.filter((transaction) => {
      if (filterType === 'ALL') return true;
      return transaction.type === filterType;
    }) || [];

  const totalCredits =
    dailyData?.transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalPayments =
    dailyData?.transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

  const creditCount = dailyData?.transactions.filter((t) => t.type === 'CREDIT').length || 0;
  const paymentCount = dailyData?.transactions.filter((t) => t.type === 'PAYMENT').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Daily Collection</h3>
          <p className="text-muted-foreground">View daily transactions and collection summary</p>
        </div>
        {dailyData && dailyData.transactions.length > 0 && (
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Date Selection */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="size-5" />
              <span>Select Date</span>
            </CardTitle>
            <CardDescription>Choose a date to view transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Quick Date Options */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Select</CardTitle>
            <CardDescription>Jump to recent dates quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {getQuickDateOptions().map((option, index) => (
              <Button
                key={index}
                variant={isSameDay(option.date, selectedDate) ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDate(option.date)}
              >
                {option.label}
                <span className="ml-auto text-muted-foreground">
                  {format(option.date, 'MMM dd')}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <IndianRupee className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {paymentCount} payment{paymentCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Given</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              {creditCount} credit{creditCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalPayments >= totalCredits ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(totalPayments - totalCredits)}
            </div>
            <p className="text-xs text-muted-foreground">Payments minus credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyData?.transactions.length || 0}</div>
            <p className="text-xs text-muted-foreground">For {getDateDisplay(selectedDate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Transactions for {getDateDisplay(selectedDate)}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select
                value={filterType}
                onValueChange={(value: 'ALL' | 'CREDIT' | 'PAYMENT') => setFilterType(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Transactions</SelectItem>
                  <SelectItem value="PAYMENT">Payments Only</SelectItem>
                  <SelectItem value="CREDIT">Credits Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-muted-foreground">
                No transactions found
              </h3>
              <p className="text-sm text-muted-foreground">
                {filterType === 'ALL'
                  ? `No transactions recorded for ${getDateDisplay(selectedDate)}`
                  : `No ${filterType.toLowerCase()} transactions for ${getDateDisplay(selectedDate)}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transaction Type Tabs */}
              <Tabs
                value={filterType}
                onValueChange={(value) => setFilterType(value as 'ALL' | 'CREDIT' | 'PAYMENT')}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ALL">All ({dailyData?.transactions.length || 0})</TabsTrigger>
                  <TabsTrigger value="PAYMENT" className="text-green-600">
                    Payments ({paymentCount})
                  </TabsTrigger>
                  <TabsTrigger value="CREDIT" className="text-red-600">
                    Credits ({creditCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Transactions Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.transaction_date), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {transaction.customer_id.slice(0, 8)}...
                          </div>
                        </div>
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
                          className={`text-lg font-bold ${
                            transaction.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'
                          }`}
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

              {/* Summary Footer */}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Showing {filteredTransactions.length} of {dailyData?.transactions.length || 0}{' '}
                    transactions
                  </span>
                  {filterType !== 'ALL' && (
                    <div className="flex items-center space-x-4">
                      <span
                        className={`font-medium ${filterType === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}
                      >
                        Total:{' '}
                        {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
