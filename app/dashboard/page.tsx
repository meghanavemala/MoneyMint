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
      <div className="flex-1 p-2 sm:px-4 md:px-8 md:py-6 lg:px-12 lg:py-8">
        <Tabs defaultValue="database" className="space-y-4 md:space-y-6">
          <TabsList className="no-scrollbar mb-2 flex w-full gap-1 overflow-x-auto rounded-lg md:mb-4 md:gap-2">
            <TabsTrigger
              value="database"
              className="flex min-w-[140px] items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm md:min-w-[160px] md:text-base lg:min-w-[180px] lg:text-lg"
            >
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger
              value="add-entry"
              className="flex min-w-[140px] items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm md:min-w-[160px] md:text-base lg:min-w-[180px] lg:text-lg"
            >
              <span>Add Entry</span>
            </TabsTrigger>
            <TabsTrigger
              value="daily-collection"
              className="flex min-w-[140px] items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm md:min-w-[160px] md:text-base lg:min-w-[180px] lg:text-lg"
            >
              <span>Daily Collection</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="database" className="space-y-4 md:space-y-6">
            <DatabaseTab />
          </TabsContent>
          <TabsContent value="add-entry" className="space-y-4 md:space-y-6">
            <AddEntryTab />
          </TabsContent>
          <TabsContent value="daily-collection" className="space-y-4 md:space-y-6">
            <DailyCollectionTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
