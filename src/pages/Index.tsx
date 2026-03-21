import DashboardHeader from "@/components/ostad/DashboardHeader";
import NextClassCard from "@/components/ostad/NextClassCard";
import TodoList from "@/components/ostad/TodoList";
import ClassOverview from "@/components/ostad/ClassOverview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-12 space-y-6">
        <NextClassCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodoList />
          <ClassOverview />
        </div>
      </main>
    </div>
  );
};

export default Index;
