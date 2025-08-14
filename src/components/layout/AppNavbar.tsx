  import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, LogOut, Settings, User, CheckCircle, XCircle, PlayCircle, Flag } from 'lucide-react'; // Added icons
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettingsModal } from '@/components/modals/ProfileSettingsModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'notification' | 'task';
  message: string;
  timestamp: string;
  department?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'finished' | 'aborted';
  department: string;
  assignedTo?: string;
  dueDate: string;
}

const mockNotifications: Notification[] = [
  { id: 'N001', type: 'notification', message: 'New policy update: Remote work guidelines updated.', timestamp: '2024-07-28T10:00:00', department: 'HR' },
  { id: 'N002', type: 'notification', message: 'Server maintenance scheduled for tonight.', timestamp: '2024-07-28T09:30:00', department: 'ICT' },
  { id: 'N003', type: 'notification', message: 'Monthly financial report is due next week.', timestamp: '2024-07-27T15:00:00', department: 'Finance' },
];

const mockTasks: Task[] = [
  { id: 'T001', title: 'Review Q2 Safety Reports', description: 'Please review and provide feedback on the Q2 safety incident reports by EOD.', status: 'pending', department: 'Health and Safety', dueDate: '2024-07-30' },
  { id: 'T002', title: 'Update Employee Contact Info', description: 'Verify and update contact information for all new hires in the HR system.', status: 'in-progress', department: 'HR', assignedTo: 'Current User (Mock)', dueDate: '2024-08-05' },
  { id: 'T003', title: 'Install New Software on PC-005', description: 'Install Adobe Photoshop and Illustrator on PC-005 for the design team.', status: 'pending', department: 'ICT', dueDate: '2024-07-29' },
];

export function AppNavbar() {
  const { user, logout } = useAuth();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showTaskActionModal, setShowTaskActionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [abortReason, setAbortReason] = useState<string>('');
  const { toast } = useToast();

  if (!user) return null;

  const userInitials = user.username.charAt(0).toUpperCase();
  const roleColors: Record<string, string> = {
    'ICT': 'bg-blue-500',
    'Finance': 'bg-green-500',
    'HR': 'bg-purple-500',
    'Health and Safety': 'bg-red-500',
    'Logistics': 'bg-orange-500',
    'Admin': 'bg-gray-800'
  };

  const handleTaskAction = (taskId: string, action: 'accept' | 'start' | 'finish' | 'abort') => {
    setMockTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        let newStatus = task.status;
        let toastMessage = '';
        let newAssignedTo = task.assignedTo;

        switch (action) {
          case 'accept':
            newStatus = 'accepted';
            newAssignedTo = user.username; // Assign to current user on accept
            toastMessage = `Task \'${task.title}\' accepted.`;
            break;
          case 'start':
            newStatus = 'in-progress';
            toastMessage = `Task \'${task.title}\' started.`;
            break;
          case 'finish':
            newStatus = 'finished';
            toastMessage = `Task \'${task.title}\' finished.`;
            break;
          case 'abort':
            newStatus = 'aborted';
            toastMessage = `Task \'${task.title}\' aborted.`;
            // Optionally send abortReason to backend
            console.log(`Task ${taskId} aborted. Reason: ${abortReason}`);
            break;
        }
        toast({
          title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: toastMessage,
        });
        return { ...task, status: newStatus, assignedTo: newAssignedTo };
      }
      return task;
    }));
    setShowTaskActionModal(false);
    setSelectedTask(null);
    setAbortReason('');
  };

  // Mock state for tasks, to be replaced by actual data management
  const [currentTasks, setMockTasks] = useState<Task[]>(mockTasks);

  const unreadNotificationsCount = mockNotifications.length + currentTasks.filter(task => task.status === 'pending').length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Sidebar trigger and title */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">s</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Swiish</h1>
              <p className="text-xs text-muted-foreground">{user.companyName}</p>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center gap-4">
          {/* Notifications/Tasks Trigger */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotificationModal(true)}>
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-destructive-foreground">
                {unreadNotificationsCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${roleColors[user.role] || 'bg-primary'} text-white text-sm`}>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProfileSettingsModal 
        open={showProfileSettings} 
        onOpenChange={setShowProfileSettings} 
      />

      {/* Notifications and Tasks Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Notifications & Tasks</DialogTitle>
            <DialogDescription>
              View your latest notifications and manage assigned tasks.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b p-0 h-auto bg-transparent">
              <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3">
                Notifications ({mockNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3">
                Tasks ({currentTasks.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notifications" className="p-6 pt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {mockNotifications.length > 0 ? (
                    mockNotifications.map(notification => (
                      <div key={notification.id} className="border-b pb-2 last:border-b-0">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.department && <span className="mr-2">{notification.department} •</span>}
                          {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">No new notifications.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tasks" className="p-6 pt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {currentTasks.length > 0 ? (
                    currentTasks.map(task => (
                      <div key={task.id} className="border rounded-lg p-3 space-y-2">
                        <h4 className="font-semibold text-base">{task.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className={`capitalize ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}`}>{task.status.replace('-', ' ')}</Badge>
                          <span>• Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                          {task.assignedTo && <span>• Assigned to: {task.assignedTo}</span>}
                          <span>• Department: {task.department}</span>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => { setSelectedTask(task); setShowTaskActionModal(true); }}
                        >
                          Open
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">No tasks assigned.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Task Action Modal */}
      <Dialog open={showTaskActionModal} onOpenChange={setShowTaskActionModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Task: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Manage the status of this task.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="capitalize">Status: {selectedTask.status.replace('-', ' ')}</Badge>
                <Badge variant="outline">Due: {format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}</Badge>
                {selectedTask.assignedTo && <Badge variant="outline">Assigned to: {selectedTask.assignedTo}</Badge>}
                <Badge variant="outline">Department: {selectedTask.department}</Badge>
              </div>

              {selectedTask.status === 'aborted' && abortReason && (
                <div className="space-y-2">
                  <Label>Abort Reason</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{abortReason}</p>
                </div>
              )}

              {selectedTask.status === 'pending' && (
                <Button onClick={() => handleTaskAction(selectedTask.id, 'accept')} className="w-full gap-2">
                  <CheckCircle className="h-4 w-4" /> Accept Task
                </Button>
              )}
              {(selectedTask.status === 'accepted' || selectedTask.status === 'in-progress') && (
                <Button onClick={() => handleTaskAction(selectedTask.id, 'start')} className="w-full gap-2">
                  <PlayCircle className="h-4 w-4" /> Start Task
                </Button>
              )}
              {(selectedTask.status === 'accepted' || selectedTask.status === 'in-progress') && (
                <Button onClick={() => handleTaskAction(selectedTask.id, 'finish')} className="w-full gap-2">
                  <Flag className="h-4 w-4" /> Mark as Finished
                </Button>
              )}
              {(selectedTask.status === 'pending' || selectedTask.status === 'accepted' || selectedTask.status === 'in-progress') && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="abortReason">Reason for Aborting (Optional)</Label>
                  <Textarea 
                    id="abortReason" 
                    placeholder="E.g., Task no longer relevant, duplicate request" 
                    value={abortReason}
                    onChange={(e) => setAbortReason(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    variant="destructive" 
                    onClick={() => handleTaskAction(selectedTask.id, 'abort')} 
                    className="w-full gap-2 mt-2"
                  >
                    <XCircle className="h-4 w-4" /> Abort Task
                  </Button>
                </div>
              )}

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskActionModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}