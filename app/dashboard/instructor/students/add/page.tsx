"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { UserPlus, Mail, Eye, EyeOff, Copy, Check, ArrowLeft, Camera } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getCourseOptions } from "@/data/instructor-courses"

const studentSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),

  // Academic Information
  studentId: z.string().min(8, "Student ID must be at least 8 characters"),
  course: z.string().min(1, "Please select a course"),
  section: z.string().min(1, "Please select a section"),
  year: z.string().min(1, "Please select a year"),
  semester: z.string().min(1, "Please select a semester"),

  // Practicum Information
  agency: z.string().min(2, "Agency name is required"),
  agencyAddress: z.string().min(5, "Agency address is required"),
  supervisor: z.string().min(2, "Supervisor name is required"),
  supervisorEmail: z.string().email("Please enter a valid supervisor email"),
  supervisorPhone: z.string().min(10, "Supervisor phone is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),

  // Account Settings
  sendCredentials: z.boolean().default(true),
  generatePassword: z.boolean().default(true),
  customPassword: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

// Add type for created student
type CreatedStudent = StudentFormData & {
  id: string
  password: string
  avatar: string | null
  avatarFileName: string | null
  createdAt: string
}

export default function AddStudentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [createdStudent, setCreatedStudent] = useState<CreatedStudent | null>(null)
  const [copiedField, setCopiedField] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      sendCredentials: true,
      generatePassword: true,
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phone: "",
      studentId: "",
      course: "",
      section: "",
      year: "",
      semester: "",
      agency: "",
      agencyAddress: "",
      supervisor: "",
      supervisorEmail: "",
      supervisorPhone: "",
      startDate: "",
      endDate: "",
      customPassword: "",
    },
  })

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    setValue("customPassword", password)
  }

  const generateStudentId = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 99999)
      .toString()
      .padStart(5, "0")
    return `${year}-${randomNum}`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true)

    // Simulate API call with avatar upload
    setTimeout(() => {
      const newStudent: CreatedStudent = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        password: data.generatePassword ? generatedPassword : (data.customPassword || ""),
        avatar: avatarPreview || null,
        avatarFileName: avatarFile?.name || null,
        createdAt: new Date().toISOString(),
      }

      setCreatedStudent(newStudent)
      setIsSuccessDialogOpen(true)
      setIsLoading(false)

      console.log("Created student with avatar:", newStudent)
    }, 2000)
  }

  const watchGeneratePassword = watch("generatePassword")
  const watchSendCredentials = watch("sendCredentials")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600">Create a new student account for practicum management</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic student information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={avatarPreview || "/placeholder.svg?height=80&width=80"} alt="Profile" />
                      <AvatarFallback className="text-lg bg-gray-100">
                        {watch("firstName")?.[0]?.toUpperCase() || ""}
                        {watch("lastName")?.[0]?.toUpperCase() || ""}
                      </AvatarFallback>
                    </Avatar>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={removeAvatar}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {avatarFile ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {avatarFile && (
                        <Button type="button" variant="outline" onClick={removeAvatar}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-600">JPG, PNG or GIF. Max 5MB. Recommended: 400x400px</p>
                    {avatarFile && (
                      <p className="text-sm text-green-600">
                        Selected: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)}MB)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register("firstName")} placeholder="Enter first name" />
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...register("middleName")} placeholder="Enter middle name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register("lastName")} placeholder="Enter last name" />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="student@omsc.edu.ph" />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" {...register("phone")} placeholder="+63 912 345 6789" />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Student's academic details and enrollment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <div className="flex gap-2">
                      <Input id="studentId" {...register("studentId")} placeholder="2024-00001" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setValue("studentId", generateStudentId())}
                      >
                        Generate
                      </Button>
                    </div>
                    {errors.studentId && <p className="text-sm text-red-600">{errors.studentId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course *</Label>
                    <Select onValueChange={(value) => setValue("course", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                                          <SelectContent>
                      {getCourseOptions().map((course) => (
                        <SelectItem key={course.value} value={course.value}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                    {errors.course && <p className="text-sm text-red-600">{errors.course.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section *</Label>
                    <Select onValueChange={(value) => setValue("section", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4A">4A</SelectItem>
                        <SelectItem value="4B">4B</SelectItem>
                        <SelectItem value="4C">4C</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.section && <p className="text-sm text-red-600">{errors.section.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year Level *</Label>
                    <Select onValueChange={(value) => setValue("year", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4th">4th Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && <p className="text-sm text-red-600">{errors.year.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <Select onValueChange={(value) => setValue("semester", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Semester</SelectItem>
                        <SelectItem value="2nd">2nd Semester</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.semester && <p className="text-sm text-red-600">{errors.semester.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practicum Information */}
            <Card>
              <CardHeader>
                <CardTitle>Practicum Information</CardTitle>
                <CardDescription>Details about the student's practicum placement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency/Company Name *</Label>
                  <Input id="agency" {...register("agency")} placeholder="Enter agency or company name" />
                  {errors.agency && <p className="text-sm text-red-600">{errors.agency.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyAddress">Agency Address *</Label>
                  <Textarea
                    id="agencyAddress"
                    {...register("agencyAddress")}
                    placeholder="Enter complete agency address"
                    rows={3}
                  />
                  {errors.agencyAddress && <p className="text-sm text-red-600">{errors.agencyAddress.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor Name *</Label>
                    <Input id="supervisor" {...register("supervisor")} placeholder="Enter supervisor name" />
                    {errors.supervisor && <p className="text-sm text-red-600">{errors.supervisor.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorEmail">Supervisor Email *</Label>
                    <Input
                      id="supervisorEmail"
                      type="email"
                      {...register("supervisorEmail")}
                      placeholder="supervisor@agency.com"
                    />
                    {errors.supervisorEmail && <p className="text-sm text-red-600">{errors.supervisorEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorPhone">Supervisor Phone *</Label>
                    <Input id="supervisorPhone" {...register("supervisorPhone")} placeholder="+63 912 345 6789" />
                    {errors.supervisorPhone && <p className="text-sm text-red-600">{errors.supervisorPhone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" type="date" {...register("startDate")} />
                    {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input id="endDate" type="date" {...register("endDate")} />
                    {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Configure student account access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generatePassword"
                    {...register("generatePassword")}
                    defaultChecked={true}
                    onCheckedChange={(checked) => {
                      setValue("generatePassword", checked as boolean)
                      if (checked) {
                        generatePassword()
                      }
                    }}
                  />
                  <Label htmlFor="generatePassword">Generate secure password</Label>
                </div>

                {watchGeneratePassword && (
                  <div className="space-y-2">
                    <Label>Generated Password</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={generatedPassword}
                        readOnly
                        className="font-mono"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}

                {!watchGeneratePassword && (
                  <div className="space-y-2">
                    <Label htmlFor="customPassword">Custom Password</Label>
                    <Input
                      id="customPassword"
                      type={showPassword ? "text" : "password"}
                      {...register("customPassword")}
                      placeholder="Enter custom password"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox id="sendCredentials" {...register("sendCredentials")} defaultChecked={true} />
                  <Label htmlFor="sendCredentials">Send credentials via email</Label>
                </div>

                {watchSendCredentials && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Login credentials will be automatically sent to the student's email address.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setValue("studentId", generateStudentId())}
                >
                  Generate Student ID
                </Button>
                <Button type="button" variant="outline" className="w-full justify-start" onClick={generatePassword}>
                  Generate New Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements Checklist</CardTitle>
                <CardDescription>Documents needed for practicum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-2 h-2 p-0 bg-red-500"></Badge>
                    <span>Medical Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-2 h-2 p-0 bg-red-500"></Badge>
                    <span>Insurance Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-2 h-2 p-0 bg-red-500"></Badge>
                    <span>Company MOA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-2 h-2 p-0 bg-red-500"></Badge>
                    <span>Practicum Agreement</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    These requirements will be automatically added to the student's checklist.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary-500 hover:bg-primary-600">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Student...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Student Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              Student Created Successfully!
            </DialogTitle>
            <DialogDescription>
              The student account has been created and credentials have been prepared.
            </DialogDescription>
          </DialogHeader>

          {createdStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Student ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-white px-2 py-1 rounded">{createdStudent.studentId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(createdStudent.studentId, "studentId")}
                    >
                      {copiedField === "studentId" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-white px-2 py-1 rounded font-mono">
                      {showPassword ? createdStudent.password : "••••••••••••"}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(createdStudent.password, "password")}
                    >
                      {copiedField === "password" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{createdStudent.email}</span>
                </div>
              </div>

              {createdStudent.sendCredentials && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Login credentials have been sent to the student's email address.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccessDialogOpen(false)
                router.push("/dashboard/instructor/students")
              }}
            >
              View All Students
            </Button>
            <Button
              onClick={() => {
                setIsSuccessDialogOpen(false)
                // Reset form for creating another student
                window.location.reload()
              }}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Create Another Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
