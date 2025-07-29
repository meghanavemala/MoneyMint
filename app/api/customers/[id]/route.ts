import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  customers,
  transactions,
  type Customer,
  type Transaction,
} from '@/db/schema/finance-schema';
import { and, eq, desc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

// Define the customer type with transactions
type CustomerWithTransactions = Customer & {
  transactions: Array<{
    id: string;
    amount: string;
    type: 'CREDIT' | 'PAYMENT';
    description: string | null;
    transactionDate: Date;
    customerId: string;
    profileId: string;
    createdAt: Date;
  }>;
};

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    // Query the customer
    const customerResult = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.profileId, userId)))
      .limit(1);

    if (!customerResult.length) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Query the customer's transactions
    const transactionsResult = await db
      .select()
      .from(transactions)
      .where(eq(transactions.customerId, id))
      .orderBy(desc(transactions.transactionDate));

    // Combine the results
    const customer = {
      ...customerResult[0],
      transactions: transactionsResult,
    } as CustomerWithTransactions;

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Convert Decimal.js to string for JSON serialization
    const result = {
      ...customer,
      totalCredit: customer.totalCredit?.toString() ?? '0',
      totalPaid: customer.totalPaid?.toString() ?? '0',
      balance: customer.balance?.toString() ?? '0',
      transactions: customer.transactions.map((t) => ({
        ...t,
        amount: t.amount?.toString() ?? '0',
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
