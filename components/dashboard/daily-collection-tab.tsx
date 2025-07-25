"use client"

import { useState, useEffect } from "react"
import { format, subDays, isToday, isYesterday, parseISO } from "date-fns"
import {
  Calendar,
  Loader2,
  DollarSign,
  TrendingUp,
  ArrowUpDown
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { getDailyCollectionsAction } from "@/actions/finance-actions"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

type DailyCollection = {
  date: string
  totalCollection: number
  transactions: Array<{
    id: string
    customerId: string
    customerName: string
    amount: string
    description: string | null
    transactionDate: string
  }>
}

export function DailyCollectionTab() {
  const [dailyData, setDailyData] = useState<DailyCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>({
    key: "date",
    direction: "desc"
  })

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      loadDailyData(dateRange.from, dateRange.to)
    }
  }, [dateRange])

  const loadDailyData = async (from: Date, to: Date) => {
    try {
      setLoading(true)
      const result = await getDailyCollectionsAction(from)

      if (result.isSuccess) {
        setDailyData(result.data)
      } else {
        toast.error(result.error || "Failed to load daily collections")
      }
    } catch (error) {
      console.error("Error loading daily collections:", error)
      toast.error("An error occurred while loading daily collections")
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc"
        }
      }
      return {
        key,
        direction: "asc"
      }
    })
  }

  const getSortedTransactions = () => {
    if (!dailyData) return []

    const transactions = [...dailyData.transactions]

    if (!sortConfig) return transactions

    return transactions.sort((a, b) => {
      if (sortConfig.key === "amount") {
        const aAmount = parseFloat(a.amount)
        const bAmount = parseFloat(b.amount)
        return sortConfig.direction === "asc"
          ? aAmount - bAmount
          : bAmount - aAmount
      } else if (sortConfig.key === "customerName") {
        return sortConfig.direction === "asc"
          ? a.customerName.localeCompare(b.customerName)
          : b.customerName.localeCompare(a.customerName)
      } else if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.transactionDate).getTime() -
              new Date(b.transactionDate).getTime()
          : new Date(b.transactionDate).getTime() -
              new Date(a.transactionDate).getTime()
      }
      return 0
    })
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "MMMM d, yyyy")
  }

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "h:mm a")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Daily Collections
          </h2>
          <p className="text-muted-foreground">
            View and manage daily payment collections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            className="w-[250px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              setDateRange({
                from: today,
                to: today
              })
            }}
          >
            Today
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : dailyData ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatDate(dailyData.date)}
                </CardTitle>
                <Calendar className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dailyData.totalCollection)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Total collected today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <DollarSign className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dailyData.transactions.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  Total payments received
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Payment
                </CardTitle>
                <TrendingUp className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dailyData.transactions.length > 0
                    ? formatCurrency(
                        dailyData.totalCollection /
                          dailyData.transactions.length
                      )
                    : formatCurrency(0)}
                </div>
                <p className="text-muted-foreground text-xs">Per transaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Updated
                </CardTitle>
                <Calendar className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(
                    dailyData.transactions[0]?.transactionDate ||
                      new Date().toISOString()
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatDate(
                    dailyData.transactions[0]?.transactionDate ||
                      new Date().toISOString()
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                List of all payments received on {formatDate(dailyData.date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyData.transactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center">
                            <span>Time</span>
                            <ArrowUpDown className="ml-2 size-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleSort("customerName")}
                        >
                          <div className="flex items-center">
                            <span>Customer</span>
                            <ArrowUpDown className="ml-2 size-4" />
                          </div>
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead
                          className="hover:bg-muted/50 cursor-pointer text-right"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center justify-end">
                            <span>Amount</span>
                            <ArrowUpDown className="ml-2 size-4" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedTransactions().map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {formatTime(transaction.transactionDate)}
                          </TableCell>
                          <TableCell>{transaction.customerName}</TableCell>
                          <TableCell>
                            {transaction.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                            +{formatCurrency(parseFloat(transaction.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="text-muted-foreground mb-4 size-12" />
                  <h3 className="text-lg font-medium">No transactions found</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No payments were recorded for {formatDate(dailyData.date)}.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      setDateRange({ from: new Date(), to: new Date() })
                    }
                  >
                    View Today's Transactions
                  </Button>
                </div>
              )}
            </CardContent>
            {dailyData.transactions.length > 0 && (
              <CardFooter className="bg-muted/50 px-6 py-3">
                <div className="text-muted-foreground flex w-full items-center justify-between text-sm">
                  <div>{dailyData.transactions.length} transactions</div>
                  <div className="font-medium">
                    Total: {formatCurrency(dailyData.totalCollection)}
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="text-muted-foreground mb-4 size-12" />
          <h3 className="text-lg font-medium">No data available</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Select a date range to view daily collections.
          </p>
        </div>
      )}
    </div>
  )
}
