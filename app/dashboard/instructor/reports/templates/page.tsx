"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { COURSES, getCourseOptions } from "@/data/instructor-courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, MoreHorizontal, FileText, Copy, Eye } from "lucide-react"

// Type definitions
type ReportTemplate = {
  id: number
  title: string
  description: string
  type: string
  sections: string[]
  instructions: string
  minWordCount: number
  maxWordCount: number
  courses: string[]
  isRequired: boolean
  isActive: boolean
  createdAt: string
  usageCount: number
}

type NewTemplate = {
  title: string
  description: string
  type: string
  sections: string[]
  instructions: string
  minWordCount: number
  maxWordCount: number
  courses: string[]
  isRequired: boolean
  isActive: boolean
}

// Mock data for report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 1,
    title: "Weekly Progress Report",
    description: "Standard weekly report template for tracking student progress",
    type: "Weekly",
    sections: [
      "Summary of Activities",
      "Hours Logged",
      "Key Accomplishments",
      "Challenges Faced",
      "Learning Outcomes",
      "Next Week's Goals",
    ],
    instructions:
      "Submit a detailed weekly report covering all activities, accomplishments, and learnings from the past week.",
    minWordCount: 500,
    maxWordCount: 1000,
    courses: COURSES.filter(c => c.category === "Technology").map(c => c.code),
    isRequired: true,
    isActive: true,
    createdAt: "2024-01-10",
    usageCount: 156,
  },
  {
    id: 2,
    title: "Mid-Term Narrative Report",
    description: "Comprehensive reflection report for mid-term evaluation",
    type: "Narrative",
    sections: [
      "Introduction and Objectives",
      "Detailed Experience Description",
      "Skills Development Analysis",
      "Challenges and Solutions",
      "Professional Growth Reflection",
      "Future Goals and Expectations",
    ],
    instructions:
      "Provide a comprehensive narrative reflection on your practicum experience covering the first half of the semester.",
    minWordCount: 1500,
    maxWordCount: 2500,
    courses: COURSES.map(c => c.code),
    isRequired: true,
    isActive: true,
    createdAt: "2024-01-08",
    usageCount: 42,
  },
  {
    id: 3,
    title: "Final Practicum Report",
    description: "Complete practicum experience summary and evaluation",
    type: "Final",
    sections: [
      "Executive Summary",
      "Practicum Overview",
      "Technical Skills Acquired",
      "Soft Skills Development",
      "Project Contributions",
      "Industry Insights",
      "Career Readiness Assessment",
      "Recommendations",
    ],
    instructions:
      "Submit a comprehensive final report summarizing your entire practicum experience and professional development.",
    minWordCount: 2000,
    maxWordCount: 4000,
    courses: COURSES.map(c => c.code),
    isRequired: true,
    isActive: true,
    createdAt: "2024-01-05",
    usageCount: 38,
  },
  {
    id: 4,
    title: "Technical Project Report",
    description: "Detailed report on specific technical projects completed",
    type: "Project",
    sections: [
      "Project Overview",
      "Technical Requirements",
      "Implementation Details",
      "Technologies Used",
      "Challenges and Solutions",
      "Results and Outcomes",
      "Lessons Learned",
    ],
    instructions:
      "Document a specific technical project you worked on during your practicum, including technical details and outcomes.",
    minWordCount: 800,
    maxWordCount: 1500,
    courses: COURSES.filter(c => c.category === "Technology").map(c => c.code),
    isRequired: false,
    isActive: true,
    createdAt: "2024-01-03",
    usageCount: 24,
  },
]

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>(reportTemplates)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    title: "",
    description: "",
    type: "Weekly",
    sections: [],
    instructions: "",
    minWordCount: 500,
    maxWordCount: 1000,
    courses: [],
    isRequired: true,
    isActive: true,
  })

  const handleCreateTemplate = () => {
    const template: ReportTemplate = {
      ...newTemplate,
      id: Math.max(...templates.map((t) => t.id)) + 1,
      createdAt: new Date().toISOString().split("T")[0],
      usageCount: 0,
    }
    setTemplates([...templates, template])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditTemplate = () => {
    if (!selectedTemplate) return
    
    setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? { ...selectedTemplate } : t)))
    setIsEditDialogOpen(false)
    setSelectedTemplate(null)
  }

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const handleToggleActive = (id: number) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)))
  }

  const resetForm = () => {
    setNewTemplate({
      title: "",
      description: "",
      type: "Weekly",
      sections: [],
      instructions: "",
      minWordCount: 500,
      maxWordCount: 1000,
      courses: [],
      isRequired: true,
      isActive: true,
    })
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "weekly":
        return "bg-blue-100 text-blue-800"
      case "narrative":
        return "bg-purple-100 text-purple-800"
      case "final":
        return "bg-green-100 text-green-800"
      case "project":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Templates</h1>
          <p className="text-gray-600">Manage report templates for student submissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
              <DialogDescription>
                Create a new report template that students will use for their submissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="e.g., Weekly Progress Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Narrative">Narrative</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description of the report template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate({ ...newTemplate, instructions: e.target.value })}
                  placeholder="Detailed instructions for students..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWordCount">Min Word Count</Label>
                  <Input
                    id="minWordCount"
                    type="number"
                    value={newTemplate.minWordCount}
                    onChange={(e) => setNewTemplate({ ...newTemplate, minWordCount: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWordCount">Max Word Count</Label>
                  <Input
                    id="maxWordCount"
                    type="number"
                    value={newTemplate.maxWordCount}
                    onChange={(e) => setNewTemplate({ ...newTemplate, maxWordCount: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Courses</Label>
                <div className="grid grid-cols-1 gap-2">
                  {COURSES.map((course) => (
                    <div key={course.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={course.code}
                        checked={newTemplate.courses.includes(course.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTemplate({
                              ...newTemplate,
                              courses: [...newTemplate.courses, course.code],
                            })
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              courses: newTemplate.courses.filter((c) => c !== course.code),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={course.code} className="text-sm">
                        <span className="font-medium">{course.code}</span> - {course.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={newTemplate.isRequired}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isRequired: checked as boolean })}
                />
                <Label htmlFor="isRequired">This is a required report</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newTemplate.isActive}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isActive: checked as boolean })}
                />
                <Label htmlFor="isActive">Template is active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-primary-500 hover:bg-primary-600">
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Report Template</DialogTitle>
              <DialogDescription>
                Update the report template settings and requirements.
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={selectedTemplate.title}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
                      placeholder="e.g., Weekly Progress Report"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Report Type</Label>
                    <Select
                      value={selectedTemplate.type}
                      onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Narrative">Narrative</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                    placeholder="Brief description of the report template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-instructions">Instructions</Label>
                  <Textarea
                    id="edit-instructions"
                    value={selectedTemplate.instructions}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, instructions: e.target.value })}
                    placeholder="Detailed instructions for students..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-minWordCount">Min Word Count</Label>
                    <Input
                      id="edit-minWordCount"
                      type="number"
                      value={selectedTemplate.minWordCount}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, minWordCount: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-maxWordCount">Max Word Count</Label>
                    <Input
                      id="edit-maxWordCount"
                      type="number"
                      value={selectedTemplate.maxWordCount}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, maxWordCount: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Courses</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {COURSES.map((course) => (
                      <div key={course.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${course.code}`}
                          checked={selectedTemplate.courses.includes(course.code)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTemplate({
                                ...selectedTemplate,
                                courses: [...selectedTemplate.courses, course.code],
                              })
                            } else {
                              setSelectedTemplate({
                                ...selectedTemplate,
                                courses: selectedTemplate.courses.filter((c) => c !== course.code),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${course.code}`} className="text-sm">
                          <span className="font-medium">{course.code}</span> - {course.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isRequired"
                    checked={selectedTemplate.isRequired}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, isRequired: checked as boolean })}
                  />
                  <Label htmlFor="edit-isRequired">This is a required report</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={selectedTemplate.isActive}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, isActive: checked as boolean })}
                  />
                  <Label htmlFor="edit-isActive">Template is active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTemplate} className="bg-primary-500 hover:bg-primary-600">
                Update Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-green-600">{templates.filter((t) => t.isActive).length}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Required</p>
                <p className="text-2xl font-bold text-red-600">{templates.filter((t) => t.isRequired).length}</p>
              </div>
              <Badge className="bg-red-100 text-red-800">Required</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Manage and configure report templates for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Word Count</TableHead>
                  <TableHead>Target Courses</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                        {template.isRequired && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs mt-1">
                            Required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {template.minWordCount} - {template.maxWordCount}
                        </div>
                        <div className="text-gray-500">words</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.courses.map((course) => (
                          <Badge key={course} variant="outline" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{template.usageCount} submissions</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => handleToggleActive(template.id)}
                        />
                        <span className="text-sm">{template.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTemplate(template)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Template
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Usage
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
