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
      <div className="flex-1 px-2 py-4 sm:px-6 md:px-12 md:py-8">
        <Tabs defaultValue="database" className="space-y-6 md:space-y-8">
          <TabsList className="no-scrollbar mb-4 flex w-full justify-center gap-2 rounded-lg md:mb-6 md:gap-4">
            <TabsTrigger
              value="database"
              className="flex min-w-[180px] max-w-[220px] items-center justify-center space-x-2 whitespace-nowrap px-4 py-2 text-base md:text-lg"
            >
              <span>Customer Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="add-entry"
              className="flex min-w-[180px] max-w-[220px] items-center justify-center space-x-2 whitespace-nowrap px-4 py-2 text-base md:text-lg"
            >
              <span>Add Entry</span>
            </TabsTrigger>
            <TabsTrigger
              value="daily-collection"
              className="flex min-w-[180px] max-w-[220px] items-center justify-center space-x-2 whitespace-nowrap px-4 py-2 text-base md:text-lg"
            >
              <span>Daily Collection</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="database" className="space-y-6 md:space-y-8">
            <DatabaseTab />
          </TabsContent>
          <TabsContent value="add-entry" className="space-y-6 md:space-y-8">
            <AddEntryTab />
          </TabsContent>
          <TabsContent value="daily-collection" className="space-y-6 md:space-y-8">
            <DailyCollectionTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
