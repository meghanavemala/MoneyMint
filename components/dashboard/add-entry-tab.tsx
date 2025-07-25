"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Search, User, DollarSign, Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import {
  getCustomersAction,
  createTransactionAction,
  createCustomerAction
} from "@/actions/finance-actions"
import type { Customer } from "@/db/schema/finance-schema"
import { z } from "zod"

const transactionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["CREDIT", "PAYMENT"], {
    required_error: "Transaction type is required"
  }),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional()
})

const newCustomerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  amount: z.string().optional() // initial credit
})

type TransactionFormData = z.infer<typeof transactionSchema>

type NewCustomerFormData = z.infer<typeof newCustomerSchema>

export function AddEntryTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "PAYMENT"
    }
  })

  const transactionType = watch("type")

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const result = await getCustomersAction()
      if (result.isSuccess && result.data) {
        // Explicitly type cast the data to Customer[]
        const customerData = result.data as Customer[]
        setCustomers(customerData)
        setFilteredCustomers(customerData)
      } else {
        toast.error(result.error || "Failed to load customers")
      }
    } catch (error) {
      console.error("Error loading customers:", error)
      toast.error("An error occurred while loading customers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomer = () => {
    setShowCustomerModal(true)
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setValue("customerId", customer.id)
    setSearchTerm(customer.name)
  }

  const handleClearSelection = () => {
    setSelectedCustomer(null)
    setSearchTerm("")
    setValue("customerId", "")
  }

  const formatAmount = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "")

    // If empty, return empty string
    if (!numericValue) return ""

    // Convert to number and format with 2 decimal places
    const number = parseInt(numericValue) / 100
    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatAmount(e.target.value)
    e.target.value = formattedValue
  }

  const handleNewCustomerSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    const formData = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as Record<string, string>
    const validation = newCustomerSchema.safeParse(formData)
    if (!validation.success) {
      toast.error(validation.error.errors[0].message)
      return
    }
    setIsSubmitting(true)
    // 1. create customer
    const result = await createCustomerAction({
      name: formData.name,
      phone: formData.phone || null,
      address: formData.address || null,
      email: formData.email || null,
      isActive: true,
      notes: null
    })

    // 2. if amount entered, add initial credit transaction
    if (
      result.isSuccess &&
      result.data &&
      formData.amount &&
      parseFloat(formData.amount) > 0
    ) {
      await createTransactionAction({
        customerId: result.data.id,
        type: "CREDIT",
        amount: formData.amount.replace(/[^0-9.]/g, ""),
        description: "Initial loan"
      })
    }

    setIsSubmitting(false)
    if (result.isSuccess && result.data) {
      toast.success("Customer created")
      setShowCustomerModal(false)
      await loadCustomers()
      handleCustomerSelect(result.data as Customer)
    } else {
      toast.error(result.error || "Failed to create customer")
    }
  }

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true)

      // Convert formatted amount back to number string
      const numericAmount = data.amount.replace(/[^0-9.]/g, "")

      const result = await createTransactionAction({
        customerId: data.customerId,
        type: data.type,
        amount: numericAmount,
        description: data.description
      })

      if (result.isSuccess) {
        toast.success("Transaction added successfully")
        reset()
        setSelectedCustomer(null)
        setSearchTerm("")
        // Refresh customer data to show updated balance
        loadCustomers()
      } else {
        toast.error(result.error || "Failed to add transaction")
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error("An error occurred while adding the transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
            <CardDescription>
              Record a new payment or credit for a customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer">Customer</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCustomer}
                  >
                    <Plus className="mr-1 size-4" /> Add Customer
                  </Button>
                </div>
                {selectedCustomer ? (
                  <div className="bg-muted/50 flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">{selectedCustomer.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {selectedCustomer.phone || "No phone number"}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
                    <Input
                      id="customer"
                      placeholder="Search customers..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {isLoading && (
                      <Loader2 className="text-muted-foreground absolute right-2.5 top-2.5 size-4 animate-spin" />
                    )}
                    {searchTerm &&
                      !isLoading &&
                      filteredCustomers.length > 0 && (
                        <div className="bg-background absolute z-10 mt-1 w-full rounded-md border shadow-lg">
                          {filteredCustomers.map(customer => (
                            <div
                              key={customer.id}
                              className="hover:bg-muted/50 cursor-pointer p-3"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="font-medium">{customer.name}</div>
                              {customer.phone && (
                                <div className="text-muted-foreground text-sm">
                                  {customer.phone}
                                </div>
                              )}
                              <div className="text-sm">
                                Balance:{" "}
                                <span
                                  className={
                                    parseFloat(customer.balance) >= 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {formatCurrency(parseFloat(customer.balance))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
                <input type="hidden" {...register("customerId")} />
                {errors.customerId && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <RadioGroup
                  defaultValue="PAYMENT"
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value: "CREDIT" | "PAYMENT") =>
                    setValue("type", value)
                  }
                  value={transactionType}
                >
                  <div>
                    <RadioGroupItem
                      value="PAYMENT"
                      id="payment"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="payment"
                      className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
                    >
                      <DollarSign className="mb-3 size-6 text-green-500" />
                      Payment
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="CREDIT"
                      id="credit"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="credit"
                      className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
                    >
                      <DollarSign className="mb-3 size-6 text-red-500" />
                      Credit
                    </Label>
                  </div>
                </RadioGroup>
                {errors.type && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-muted-foreground">(₹)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
                  <Input
                    id="amount"
                    className="pl-8"
                    placeholder="0.00"
                    {...register("amount")}
                    onChange={handleAmountChange}
                  />
                </div>
                {errors.amount && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note about this transaction..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 size-4" />
                      Add Transaction
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Today's summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    Date
                  </p>
                  <p className="text-lg font-semibold">
                    {format(new Date(), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-muted-foreground text-sm font-medium">
                    Time
                  </p>
                  <p className="text-lg font-semibold">
                    {format(new Date(), "h:mm a")}
                  </p>
                </div>
              </div>

              {selectedCustomer && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">
                      Customer Balance
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        parseFloat(selectedCustomer.balance) >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        Math.abs(parseFloat(selectedCustomer.balance))
                      )}
                      {parseFloat(selectedCustomer.balance) < 0 &&
                        " (Overpaid)"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">
                        Total Credit
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          parseFloat(selectedCustomer.totalCredit)
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">
                        Total Paid
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseFloat(selectedCustomer.totalPaid))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">Quick Tips</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>Search for a customer by name or phone number</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>
                      Select &quot;Credit&quot; to add to what the customer owes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>
                      Select &quot;Payment&quot; to record a payment from the
                      customer
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewCustomerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Lent (₹)</Label>
              <Input id="amount" name="amount" placeholder="0.00" />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCustomerModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
