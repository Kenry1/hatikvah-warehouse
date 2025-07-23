import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderPlus, Users, Calendar, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export function ProjectManagerDashboard() {
  const stats = [
    { title: 'Active Projects', value: 8, description: '3 critical deadlines', color: 'warning' as const },
    { title: 'Team Members', value: 24, description: '18 available today', color: 'success' as const },
    { title: 'Completed Tasks', value: 156, description: 'This month', color: 'success' as const },
    { title: 'Budget Utilization', value: '72%', description: 'On track', color: 'primary' as const },
  ];

  const projects = [
    { 
      id: 'PRJ001', 
      name: 'Site Network Installation', 
      progress: 75, 
      deadline: '2024-12-25', 
      status: 'on-track',
      budget: '$125,000',
      spent: '$93,750',
      teamSize: 6
    },
    { 
      id: 'PRJ002', 
      name: 'Safety Equipment Deployment', 
      progress: 45, 
      deadline: '2024-12-30', 
      status: 'delayed',
      budget: '$85,000',
      spent: '$38,250',
      teamSize: 4
    },
    { 
      id: 'PRJ003', 
      name: 'Fleet Management Integration', 
      progress: 90, 
      deadline: '2024-12-20', 
      status: 'ahead',
      budget: '$65,000',
      spent: '$58,500',
      teamSize: 3
    }
  ];

  const teamAssignments = [
    { name: 'Alice Cooper', role: 'Lead Engineer', project: 'Site Network Installation', deadline: '2024-12-18', status: 'active' },
    { name: 'Bob Martin', role: 'Safety Specialist', project: 'Safety Equipment Deployment', deadline: '2024-12-20', status: 'active' },
    { name: 'Carol White', role: 'System Analyst', project: 'Fleet Management Integration', deadline: '2024-12-15', status: 'completed' },
    { name: 'David Kim', role: 'Field Technician', project: 'Site Network Installation', deadline: '2024-12-22', status: 'active' },
  ];

  const upcomingDeadlines = [
    { task: 'Network Testing Phase', project: 'Site Network Installation', deadline: '2024-12-16', priority: 'high' },
    { task: 'Safety Protocol Review', project: 'Safety Equipment Deployment', deadline: '2024-12-17', priority: 'medium' },
    { task: 'System Integration Test', project: 'Fleet Management Integration', deadline: '2024-12-18', priority: 'high' },
    { task: 'Documentation Completion', project: 'Site Network Installation', deadline: '2024-12-19', priority: 'low' },
  ];

  return (
    <BaseDashboard
      title="Project Manager Dashboard"
      description="Create projects, assign employees, and track deadlines"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Form / Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Project Management
            </CardTitle>
            <CardDescription>Create new projects and monitor active ones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <FolderPlus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
            
            <div className="space-y-4">
              <h4 className="font-medium">Active Projects</h4>
              {projects.map((project) => (
                <div key={project.id} className="space-y-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{project.name}</p>
                    <Badge variant={
                      project.status === 'on-track' ? 'default' :
                      project.status === 'delayed' ? 'destructive' : 'secondary'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>{project.progress}% complete</span>
                    <span>{project.teamSize} members</span>
                    <span>Due: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Assignment with Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Assignments
            </CardTitle>
            <CardDescription>Assign employees to projects with deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Assign Team Member
            </Button>
            
            <div className="space-y-4">
              {teamAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">{assignment.role}</p>
                    <p className="text-xs text-muted-foreground">{assignment.project}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Due: {assignment.deadline}
                    </p>
                  </div>
                  <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Critical tasks and project milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{deadline.task}</p>
                  <p className="text-sm text-muted-foreground">{deadline.project}</p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {deadline.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    deadline.priority === 'high' ? 'destructive' :
                    deadline.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {deadline.priority}
                  </Badge>
                  {deadline.priority === 'high' && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Project Analytics
            </CardTitle>
            <CardDescription>Performance metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">87%</p>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">$275K</p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-warning">24</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">156</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Project Locations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}