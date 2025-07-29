/*
Main dashboard page with tabbed interface for database, add entry, and daily collection.
Includes theme toggle and navigation header.
*/

'use server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/header';
import { DatabaseTab } from '@/components/dashboard/database-tab';
import { AddEntryTab } from '@/components/dashboard/add-entry-tab';
import { DailyCollectionTab } from '@/components/dashboard/daily-collection-tab';

export default async function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Digital Khata Dashboard</h2>
          <div className="text-sm text-muted-foreground">
            Manage your customers, transactions, and collections
          </div>
        </div>

        <Tabs defaultValue="database" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <span>Khata Overview</span>
            </TabsTrigger>
            <TabsTrigger value="add-entry" className="flex items-center space-x-2">
              <span>Add Entry</span>
            </TabsTrigger>
            <TabsTrigger value="daily-collection" className="flex items-center space-x-2">
              <span>Daily Collection</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <DatabaseTab />
          </TabsContent>

          <TabsContent value="add-entry" className="space-y-4">
            <AddEntryTab />
          </TabsContent>

          <TabsContent value="daily-collection" className="space-y-4">
            <DailyCollectionTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
