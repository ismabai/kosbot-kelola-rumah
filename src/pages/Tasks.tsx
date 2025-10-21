import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tasks = [
  {
    id: 1,
    title: "Follow up payment Room 204",
    assignee: "You",
    dueDate: "2024-01-11",
    completed: false,
    category: "today",
  },
  {
    id: 2,
    title: "Fix AC in Room 301",
    assignee: "Maintenance Team",
    dueDate: "2024-01-12",
    completed: false,
    category: "upcoming",
  },
  {
    id: 3,
    title: "Lease renewal - Mr. Ahmad",
    assignee: "You",
    dueDate: "2024-01-14",
    completed: false,
    category: "upcoming",
  },
  {
    id: 4,
    title: "Property inspection - Building A",
    assignee: "Property Manager",
    dueDate: "2024-01-18",
    completed: false,
    category: "upcoming",
  },
  {
    id: 5,
    title: "Send rent reminder emails",
    assignee: "You",
    dueDate: "2024-01-05",
    completed: true,
    category: "done",
  },
  {
    id: 6,
    title: "Update tenant contact info",
    assignee: "Admin",
    dueDate: "2024-01-03",
    completed: true,
    category: "done",
  },
];

export default function Tasks() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const todayTasks = tasks.filter((t) => t.category === "today");
  const upcomingTasks = tasks.filter((t) => t.category === "upcoming");
  const doneTasks = tasks.filter((t) => t.category === "done");

  const TaskItem = ({ task }: { task: typeof tasks[0] }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-secondary transition-colors">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        className="mt-1"
      />
      <div className="flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={`font-medium cursor-pointer ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </label>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
          <Badge variant="outline" className="text-xs">
            {task.assignee}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your daily tasks and reminders</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{doneTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <Tabs defaultValue="today" className="w-full">
          <CardHeader>
            <TabsList className="w-full">
              <TabsTrigger value="today" className="flex-1">
                Today ({todayTasks.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1">
                Upcoming ({upcomingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="done" className="flex-1">
                Done ({doneTasks.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="today" className="space-y-3 mt-0">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => <TaskItem key={task.id} task={task} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No tasks due today
                </div>
              )}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-3 mt-0">
              {upcomingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </TabsContent>
            <TabsContent value="done" className="space-y-3 mt-0">
              {doneTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
