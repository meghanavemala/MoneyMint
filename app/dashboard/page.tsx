import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatabaseTab } from "@/components/dashboard/database-tab"
import { AddEntryTab } from "@/components/dashboard/add-entry-tab"
import { DailyCollectionTab } from "@/components/dashboard/daily-collection-tab"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sandeep Finance</h2>
      </div>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="add-entry">Add Entry</TabsTrigger>
          <TabsTrigger value="daily-collection">Daily Collection</TabsTrigger>
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
  )
}
