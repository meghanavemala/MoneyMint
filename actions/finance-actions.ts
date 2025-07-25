"use server"

import { db } from "@/db"
import { customers, transactions } from "@/db/schema"
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import type { 
  Customer, 
  NewCustomer, 
  NewTransaction, 
  Transaction 
} from "@/db/schema/finance-schema"
import type { SQL } from "drizzle-orm"
import type { PgTableWithColumns } from "drizzle-orm/pg-core"

export type CustomerWithBalance = Customer & { balance: string }

export type CustomerWithTransactions = Customer & {
  transactions: Array<{
    id: string
    amount: string
    type: 'CREDIT' | 'PAYMENT'
    description: string | null
    transactionDate: Date
    createdAt: Date
  }>
}

type WhereFn<T extends PgTableWithColumns<any>> = (
  table: T,
  operators: { 
    eq: (column: any, value: any) => SQL<unknown>;
    and: (...conditions: SQL<unknown>[]) => SQL<unknown>;
  }
) => SQL<unknown>;

export type ApiResponse<T> = {
  isSuccess: boolean;
  data?: T;
  error?: string;
};

export async function getCustomersAction() {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.profileId, userId))
      .orderBy(desc(customers.updatedAt))

    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return { isSuccess: false, error: "Failed to fetch customers" }
  }
}



export async function getCustomerByIdAction(id: string) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    const customer = await db.query.customers.findFirst({
      where: (
        table: typeof customers,
        { eq, and }: { eq: typeof eq; and: typeof and }
      ) => {
        return and(
          eq(table.id, id),
          eq(table.profileId, userId)
        );
      },
      with: {
        transactions: {
          orderBy: (
            transactions: typeof transactions,
            { desc }: { desc: (field: any) => any }
          ) => [
            desc(transactions.transactionDate)
          ],
        },
      },
    })

    if (!customer) {
      return { isSuccess: false, error: "Customer not found" }
    }

    // Calculate balance
    const balance = (
      parseFloat(customer.totalCredit) - parseFloat(customer.totalPaid)
    ).toFixed(2)

    return {
      isSuccess: true,
      data: {
        ...customer,
        balance,
        transactions: customer.transactions.map(transaction => ({
          ...transaction,
          amount: transaction.amount.toString(),
        })),
      }
    }
  } catch (error) {
    console.error("Error getting customer:", error)
    return { 
      isSuccess: false, 
      error: error instanceof Error ? error.message : "Failed to get customer" 
    }
  }
}

export async function createCustomerAction(
  data: Omit<
    NewCustomer, 
    'id' | 'createdAt' | 'updatedAt' | 'profileId' | 'totalCredit' | 'totalPaid' | 'balance'
  >
) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        ...data,
        profileId: userId,
        totalCredit: "0",
        totalPaid: "0",
        balance: "0"
      })
      .returning()

    revalidatePath("/dashboard")
    return { isSuccess: true, data: newCustomer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { isSuccess: false, error: "Failed to create customer" }
  }
}

export async function updateCustomerAction(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'profileId' | 'totalCredit' | 'totalPaid' | 'balance'>>) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(customers.id, id),
          eq(customers.profileId, userId)
        )
      )
      .returning()

    revalidatePath("/dashboard")
    return { isSuccess: true, data: updatedCustomer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { isSuccess: false, error: "Failed to update customer" }
  }
}

export async function deleteCustomerAction(id: string) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    await db
      .delete(customers)
      .where(
        and(
          eq(customers.id, id),
          eq(customers.profileId, userId)
        )
      )

    revalidatePath("/dashboard")
    return { isSuccess: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { isSuccess: false, error: "Failed to delete customer" }
  }
}

export async function getCustomerTransactionsAction(customerId: string) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.customerId, customerId),
          eq(transactions.profileId, userId)
        )
      )
      .orderBy(desc(transactions.transactionDate))

    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { isSuccess: false, error: "Failed to fetch transactions" }
  }
}

export async function createTransactionAction(
  data: Omit<
    NewTransaction, 
    'id' | 'transactionDate' | 'createdAt' | 'profileId'
  >
) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    // Start a transaction
    const result = await db.transaction(async (tx: typeof db) => {
      // Get the customer with a lock
      const [customer] = await tx
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.id, data.customerId),
            eq(customers.profileId, userId)
          )
        )
        .for("update")
        .limit(1)

      if (!customer) {
        throw new Error("Customer not found")
      }

      // Calculate new totals
      const amount = parseFloat(data.amount)
      let newTotalCredit = parseFloat(customer.totalCredit)
      let newTotalPaid = parseFloat(customer.totalPaid)

      if (data.type === "CREDIT") {
        newTotalCredit += amount
      } else {
        newTotalPaid += amount
      }

      const newBalance = newTotalCredit - newTotalPaid

      // Update customer's balance
      await tx
        .update(customers)
        .set({
          totalCredit: newTotalCredit.toString(),
          totalPaid: newTotalPaid.toString(),
          balance: newBalance.toString(),
          updatedAt: new Date()
        })
        .where(eq(customers.id, data.customerId))

      // Create the transaction
      const [newTransaction] = await tx
        .insert(transactions)
        .values({
          ...data,
          transactionDate: new Date(),
          profileId: userId
        })
        .returning()

      return newTransaction
    })

    revalidatePath("/dashboard")
    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { isSuccess: false, error: error instanceof Error ? error.message : "Failed to create transaction" }
  }
}

export async function getDailyCollectionsAction(date: Date = new Date()) {
  const { userId } = await auth()
  if (!userId) return { isSuccess: false, error: "Unauthorized" }

  try {
    // Get the start and end of the day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all transactions for the day
    const dailyTransactions = await db
      .select({
        id: transactions.id,
        customerId: transactions.customerId,
        customerName: customers.name,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        transactionDate: transactions.transactionDate
      })
      .from(transactions)
      .innerJoin(
        customers,
        eq(transactions.customerId, customers.id)
      )
      .where(
        and(
          eq(transactions.profileId, userId),
          eq(transactions.type, "PAYMENT"),
          gte(transactions.transactionDate, startOfDay),
          lte(transactions.transactionDate, endOfDay)
        )
      )
      .orderBy(desc(transactions.transactionDate))

    // Calculate total collection for the day
    const totalCollection = dailyTransactions.reduce((sum, txn: { amount: string }) => {
      return sum + parseFloat(txn.amount)
    }, 0)

    return {
      isSuccess: true,
      data: {
        date,
        totalCollection,
        transactions: dailyTransactions
      }
    }
  } catch (error) {
    console.error("Error fetching daily collections:", error)
    return { isSuccess: false, error: "Failed to fetch daily collections" }
  }
}
