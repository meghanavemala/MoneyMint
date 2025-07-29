/*
Add entry tab component for adding new customers and recording transactions.
Provides customer search, transaction entry with date picker, and form validation.
*/

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Search,
  User,
  IndianRupee,
  Loader2,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

import {
  getCustomersAction,
  createTransactionAction,
  createCustomerAction,
  type CustomerWithBalance,
} from '@/actions/finance-actions';

// Form schemas
const transactionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['CREDIT', 'PAYMENT'], {
    required_error: 'Transaction type is required',
  }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
  description: z.string().optional(),
  transactionDate: z.date().optional(),
});

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
  initialAmount: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Initial amount must be a positive number'),
  initialType: z.enum(['CREDIT', 'PAYMENT']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
type CustomerFormData = z.infer<typeof customerSchema>;

export function AddEntryTab() {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithBalance[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBalance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction form
  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'PAYMENT',
      transactionDate: new Date(),
    },
  });

  // Customer form
  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      initialType: 'CREDIT',
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
      setSelectedCustomer(null);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await getCustomersAction();
      if (result.isSuccess && result.data) {
        setCustomers(result.data);
      } else {
        toast.error(result.message || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('An error occurred while loading customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: CustomerWithBalance) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setFilteredCustomers([]);
    transactionForm.setValue('customerId', customer.id);
  };

  const handleNewSearch = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setFilteredCustomers([]);
    transactionForm.setValue('customerId', '');
  };

  const onTransactionSubmit = async (data: TransactionFormData) => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createTransactionAction({
        customer_id: data.customerId,
        amount: parseFloat(data.amount),
        type: data.type,
        description: data.description,
        transaction_date: data.transactionDate?.toISOString(),
      });

      if (result.isSuccess) {
        toast.success(`${data.type === 'CREDIT' ? 'Credit' : 'Payment'} recorded successfully`);
        transactionForm.reset({
          type: 'PAYMENT',
          transactionDate: new Date(),
        });
        handleNewSearch();
        loadCustomers(); // Refresh customer balances
      } else {
        toast.error(result.message || 'Failed to record transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('An error occurred while recording the transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCustomerSubmit = async (data: CustomerFormData) => {
    try {
      console.log('🚀 Starting customer creation with data:', data);
      setIsSubmitting(true);

      // Create customer first
      console.log('📞 Calling createCustomerAction...');
      const customerResult = await createCustomerAction({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      });

      console.log('📋 Customer creation result:', customerResult);

      if (!customerResult.isSuccess) {
        console.error('❌ Customer creation failed:', customerResult.message);
        toast.error(customerResult.message || 'Failed to create customer');
        return;
      }

      console.log('✅ Customer created successfully:', customerResult.data);
      toast.success('Customer created successfully');

      // If initial amount is provided, create initial transaction
      if (data.initialAmount && parseFloat(data.initialAmount) > 0 && data.initialType) {
        console.log('💰 Creating initial transaction...');
        const transactionResult = await createTransactionAction({
          customer_id: customerResult.data.id,
          amount: parseFloat(data.initialAmount),
          type: data.initialType,
          description: 'Initial transaction',
        });

        console.log('📊 Transaction result:', transactionResult);
        if (transactionResult.isSuccess) {
          toast.success('Initial transaction recorded');
        }
      }

      customerForm.reset();
      loadCustomers(); // Refresh customer list
    } catch (error) {
      console.error('💥 Error creating customer:', error);
      toast.error('An error occurred while creating the customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Add Entry</h3>
          <p className="text-muted-foreground">Add new customers or record transactions</p>
        </div>
      </div>

      <Tabs defaultValue="transaction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transaction" className="flex items-center space-x-2">
            <CreditCard className="size-4" />
            <span>Record Transaction</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center space-x-2">
            <User className="size-4" />
            <span>Add Customer</span>
          </TabsTrigger>
        </TabsList>

        {/* Record Transaction Tab */}
        <TabsContent value="transaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Banknote className="size-5" />
                <span>Record Transaction</span>
              </CardTitle>
              <CardDescription>
                Search for an existing customer and record a credit or payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Search */}
              <div className="space-y-4">
                <Label htmlFor="customerSearch">Search Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customerSearch"
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {selectedCustomer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      Change
                    </Button>
                  )}
                </div>

                {/* Search Results */}
                {filteredCustomers.length > 0 && !selectedCustomer && (
                  <div className="max-h-64 overflow-y-auto rounded-lg border">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="cursor-pointer border-b p-3 last:border-b-0 hover:bg-muted"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.phone && `${customer.phone} • `}
                              Balance: {formatCurrency(customer.balance || 0)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              customer.balance && customer.balance > 0 ? 'destructive' : 'default'
                            }
                          >
                            {customer.balance && customer.balance > 0 ? 'Outstanding' : 'Clear'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Customer */}
                {selectedCustomer && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{selectedCustomer.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedCustomer.phone && `${selectedCustomer.phone} • `}
                            Current Balance: {formatCurrency(selectedCustomer.balance || 0)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            selectedCustomer.balance && selectedCustomer.balance > 0
                              ? 'destructive'
                              : 'default'
                          }
                          className="px-3 py-1 text-lg"
                        >
                          {formatCurrency(selectedCustomer.balance || 0)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {searchTerm && filteredCustomers.length === 0 && !selectedCustomer && (
                  <div className="py-4 text-center text-muted-foreground">
                    No customers found. Try a different search term or add a new customer.
                  </div>
                )}
              </div>

              {/* Transaction Form */}
              {selectedCustomer && (
                <form
                  onSubmit={transactionForm.handleSubmit(onTransactionSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Transaction Type */}
                    <div className="space-y-2">
                      <Label>Transaction Type</Label>
                      <RadioGroup
                        value={transactionForm.watch('type')}
                        onValueChange={(value) =>
                          transactionForm.setValue('type', value as 'CREDIT' | 'PAYMENT')
                        }
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CREDIT" id="credit" />
                          <Label
                            htmlFor="credit"
                            className="flex cursor-pointer items-center space-x-2"
                          >
                            <span className="text-red-600">Credit Given</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PAYMENT" id="payment" />
                          <Label
                            htmlFor="payment"
                            className="flex cursor-pointer items-center space-x-2"
                          >
                            <span className="text-green-600">Payment Received</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...transactionForm.register('amount')}
                        />
                      </div>
                      {transactionForm.formState.errors.amount && (
                        <p className="text-sm text-red-600">
                          {transactionForm.formState.errors.amount.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transaction Date */}
                  <div className="space-y-2">
                    <Label>Transaction Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !transactionForm.watch('transactionDate') && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 size-4" />
                          {transactionForm.watch('transactionDate') ? (
                            format(transactionForm.watch('transactionDate')!, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={transactionForm.watch('transactionDate')}
                          onSelect={(date) => transactionForm.setValue('transactionDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add a note about this transaction..."
                      {...transactionForm.register('description')}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Record {transactionForm.watch('type') === 'CREDIT' ? 'Credit' : 'Payment'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Customer Tab */}
        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="size-5" />
                <span>Add New Customer</span>
              </CardTitle>
              <CardDescription>
                Create a new customer profile with optional initial transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter customer name"
                      {...customerForm.register('name')}
                    />
                    {customerForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {customerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      {...customerForm.register('phone')}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...customerForm.register('email')}
                    />
                    {customerForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {customerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      {...customerForm.register('address')}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about the customer..."
                    {...customerForm.register('notes')}
                  />
                </div>

                {/* Initial Transaction */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h4 className="font-medium">Initial Transaction (Optional)</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <RadioGroup
                        value={customerForm.watch('initialType')}
                        onValueChange={(value) =>
                          customerForm.setValue('initialType', value as 'CREDIT' | 'PAYMENT')
                        }
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CREDIT" id="initialCredit" />
                          <Label htmlFor="initialCredit" className="cursor-pointer text-red-600">
                            Credit
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PAYMENT" id="initialPayment" />
                          <Label htmlFor="initialPayment" className="cursor-pointer text-green-600">
                            Payment
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initialAmount">Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="initialAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...customerForm.register('initialAmount')}
                        />
                      </div>
                      {customerForm.formState.errors.initialAmount && (
                        <p className="text-sm text-red-600">
                          {customerForm.formState.errors.initialAmount.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 size-4" />
                  )}
                  Create Customer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
