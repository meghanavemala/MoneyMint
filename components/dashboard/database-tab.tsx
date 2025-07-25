"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Search,
  User,
  Phone,
  DollarSign,
  Calendar,
  Plus,
  ArrowLeft
} from "lucide-react"
import {
  getCustomersAction,
  type CustomerWithTransactions
} from "@/actions/finance-actions"
import { type Customer } from "@/db/schema/finance-schema"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

type ViewMode = "list" | "details"

export function DatabaseTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithTransactions | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const result = await getCustomersAction()
      if (result.isSuccess && result.data) {
        setCustomers(result.data)
      } else {
        toast.error(result.error || "Failed to load customers")
        setCustomers([]) // Set to empty array on error
      }
    } catch (error) {
      console.error("Error loading customers:", error)
      toast.error("An error occurred while loading customers")
      setCustomers([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCustomerSelect = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customer.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch customer details")
      }
      const customerWithTransactions = await response.json()
      setSelectedCustomer(customerWithTransactions)
      setViewMode("details")
    } catch (error) {
      console.error("Error fetching customer details:", error)
      toast.error("Failed to load customer details")
    }
  }

  if (viewMode === "details" && selectedCustomer) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setViewMode("list")}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to List
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {selectedCustomer.name}
                </CardTitle>
                <CardDescription>Customer Details</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(parseFloat(selectedCustomer.balance))}
                </div>
                <div
                  className={`text-sm ${parseFloat(selectedCustomer.balance) >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {parseFloat(selectedCustomer.balance) >= 0
                    ? "You will receive"
                    : "You owe"}
                  {formatCurrency(
                    Math.abs(parseFloat(selectedCustomer.balance))
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Phone
                </div>
                <div>{selectedCustomer.phone || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Email
                </div>
                <div>{selectedCustomer.email || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Total Credit
                </div>
                <div>
                  {formatCurrency(parseFloat(selectedCustomer.totalCredit))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Total Paid
                </div>
                <div>
                  {formatCurrency(parseFloat(selectedCustomer.totalPaid))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Status
                </div>
                <div className="flex items-center">
                  <span
                    className={`mr-2 size-2 rounded-full ${selectedCustomer.isActive ? "bg-green-500" : "bg-gray-500"}`}
                  ></span>
                  {selectedCustomer.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Last Updated
                </div>
                <div>
                  {format(
                    new Date(selectedCustomer.updatedAt),
                    "MMM d, yyyy h:mm a"
                  )}
                </div>
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="mt-6 space-y-1">
                <div className="text-muted-foreground text-sm font-medium">
                  Notes
                </div>
                <div className="bg-muted/50 rounded-md p-4">
                  {selectedCustomer.notes}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium">Transaction History</h3>
              <div className="rounded-md border">
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
                    {selectedCustomer.transactions?.length > 0 ? (
                      selectedCustomer.transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(
                              new Date(transaction.transactionDate),
                              "MMM d, yyyy h:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                transaction.type === "CREDIT"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </TableCell>
                          <TableCell
                            className={
                              transaction.type === "CREDIT"
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }
                          >
                            {transaction.type === "CREDIT" ? "-" : "+"}
                            {formatCurrency(parseFloat(transaction.amount))}
                          </TableCell>
                          <TableCell>
                            {transaction.description || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-muted-foreground py-8 text-center"
                        >
                          No transactions found for this customer.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>
              Manage your customers and view their transaction history
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-primary size-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground size-4" />
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="text-muted-foreground size-4" />
                          {customer.phone || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell
                        className={
                          parseFloat(customer.balance) >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4" />
                          {formatCurrency(
                            Math.abs(parseFloat(customer.balance))
                          )}
                          {parseFloat(customer.balance) < 0 && " (Overpaid)"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground size-4" />
                          {format(new Date(customer.updatedAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span
                            className={`mr-2 size-2 rounded-full ${customer.isActive ? "bg-green-500" : "bg-gray-500"}`}
                          ></span>
                          {customer.isActive ? "Active" : "Inactive"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      {searchTerm
                        ? "No customers match your search."
                        : "No customers found. Add your first customer to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
