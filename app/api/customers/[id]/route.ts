import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { customers } from "@/db/schema"
import { and, eq, desc } from "drizzle-orm"
import type { SQL } from "drizzle-orm"
import type { PgTableWithColumns } from "drizzle-orm/pg-core"
import type { Customer } from "@/db/schema/finance-schema"

type QueryOperators = {
  eq: (column: any, value: any) => SQL<unknown>
  and: (...conditions: SQL<unknown>[]) => SQL<unknown>
}

type WhereFn<T extends PgTableWithColumns<any>> = (
  table: T,
  operators: QueryOperators
) => SQL<unknown>

type Transaction = {
  id: string
  amount: string
  type: "CREDIT" | "PAYMENT"
  description: string | null
  transactionDate: Date
  createdAt: Date
  customerId: string
  profileId: string
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const customer = await db.query.customers.findFirst({
      where: (table: any, { eq, and }: any) => {
        const conditions = [
          eq(table.id, params.id),
          eq(table.profileId, userId)
        ] as const
        return and(...conditions)
      },
      with: {
        transactions: {
          orderBy: (
            transactions: any,
            { desc }: { desc: (field: any) => any }
          ) => [desc(transactions.transactionDate)]
        }
      }
    })

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 })
    }

    // Convert Decimal.js to string for JSON serialization
    const result = {
      ...customer,
      totalCredit: customer.totalCredit.toString(),
      totalPaid: customer.totalPaid.toString(),
      balance: customer.balance.toString(),
      transactions: customer.transactions.map((t: any) => ({
        ...t,
        amount: t.amount.toString()
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
