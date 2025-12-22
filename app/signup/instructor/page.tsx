"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff, Users } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, useActivateUser } from "@useAuth";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import OtpVerification from "@/components/otp-verification";
import { toast } from "sonner";

const instructorSignupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    middleName: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    // .refine(
    //   (email) => email.endsWith("@omsc.edu.ph"),
    //   "Email must end with @omsc.edu.ph"
    // ),
    phone: z.string().min(10, "Contact number must be at least 10 digits"),
    age: z
      .number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number",
      })
      .int("Age must be a whole number")
      .min(18, "Age must be at least 18")
      .max(100, "Age must be less than 100"),
    gender: z.string().min(1, "Please select your gender"),
    department: z.string().min(1, "Please select a department"),
    instructorId: z.string().min(1, "Instructor ID is required"),
    program: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value), {
        message: "Password must contain both uppercase and lowercase letters",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    address: z.string().optional(),
    bio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type InstructorSignupForm = z.infer<typeof instructorSignupSchema>;

export default function InstructorSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [activationToken, setActivationToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  // Get departments from API
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments({ status: "active" });
  const departments = departmentsData?.departments || [];

  // Get courses based on selected department
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses({
    status: "active",
    departmentId: selectedDepartmentId || undefined,
  });
  const courses = coursesData?.courses || [];

  // Auth hooks
  const registerMutation = useRegister();
  const activateUserMutation = useActivateUser();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InstructorSignupForm>({
    resolver: zodResolver(instructorSignupSchema),
  });

  // Watch department changes to sync selectedDepartmentId (backup in case Controller doesn't fire)
  const watchedDepartment = watch("department");

  useEffect(() => {
    if (watchedDepartment && watchedDepartment !== selectedDepartmentId) {
      setSelectedDepartmentId(watchedDepartment);
    }
  }, [watchedDepartment]);

  const onSubmit = async (data: InstructorSignupForm) => {
    setIsLoading(true);
    try {
      // Validate that program is a valid course code if provided
      let programValue = data.program;
      if (programValue && courses.length > 0) {
        const isValidCourse = courses.some(
          (course: any) => course.code === programValue
        );
        if (!isValidCourse) {
          programValue = undefined; // Don't submit invalid program values
        }
      }

      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email: data.email,
        password: data.password,
        age: data.age,
        role: "instructor", // Automatically set as instructor
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        bio: data.bio,
        instructorId: data.instructorId,
        departmentId: data.department, // Include department ID
        program: programValue, // Include program (validated course code)
      };

      const result = await registerMutation.mutateAsync(registrationData);

      // Store activation token and email for OTP verification
      setActivationToken(
        (result as { activationToken: string }).activationToken
      );
      setUserEmail(data.email);
      setShowOtpVerification(true);

      toast.success(
        "Registration successful! Please check your email for verification code."
      );
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (otpData: {
    activation_token: string;
    activation_code: string;
  }) => {
    try {
      await activateUserMutation.mutateAsync(otpData);
      toast.success("Account activated successfully! You can now sign in.");
      router.push("/login/instructor");
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please try again.");
    }
  };

  const handleResendCode = async () => {
    // For now, we'll just show a message since the server doesn't have a resend endpoint
    toast.info("Please check your email for the verification code.");
  };

  const handleBackToRegistration = () => {
    setShowOtpVerification(false);
    setActivationToken("");
    setUserEmail("");
  };

  // Show OTP verification if registration was successful
  if (showOtpVerification) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: "url(/images/auth-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />

        <div className="relative z-10 w-full max-w-md">
          <OtpVerification
            email={userEmail}
            activationToken={activationToken}
            onVerificationSuccess={handleOtpVerification}
            onBack={handleBackToRegistration}
            onResendCode={handleResendCode}
            isLoading={activateUserMutation.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url(/images/auth-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Image
                src="/images/omsc-logo.png"
                alt="OMSC Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <Image
                src="/images/tracesys-logo.png"
                alt="TracèSys Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-accent-600" />
              Create Instructor Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join TracèSys to manage students and sections
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-gray-700 font-medium"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-gray-700 font-medium"
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="middleName"
                    className="text-gray-700 font-medium"
                  >
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    placeholder="Middle name (optional)"
                    className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                    {...register("middleName")}
                  />
                  {errors.middleName && (
                    <p className="text-sm text-red-600">
                      {errors.middleName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700 font-medium">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min={18}
                      max={100}
                      step={1}
                      placeholder="Age"
                      className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                      {...register("age", { valueAsNumber: true })}
                      onKeyDown={(e) => {
                        // Prevent non-numeric characters except backspace, delete, tab, escape, enter, and arrow keys
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "Tab",
                            "Escape",
                            "Enter",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(e.key) &&
                          !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd combinations
                        ) {
                          e.preventDefault();
                        }
                        // Prevent decimal point
                        if (e.key === "." || e.key === ",") {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        // Prevent pasting non-numeric content
                        const pastedText = e.clipboardData.getData("text");
                        if (!/^\d+$/.test(pastedText)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gender"
                      className="text-gray-700 font-medium"
                    >
                      Sex *
                    </Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="instructor@omsc.edu.ph"
                    className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                    {...register("email")}
                    pattern="[a-zA-Z0-9._%+-]+@omsc\.edu\.ph"
                    title="Email must end with @omsc.edu.ph"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactNumber"
                    className="text-gray-700 font-medium"
                  >
                    Contact Number *
                  </Label>
                  <Input
                    id="contactNumber"
                    placeholder="+63 912 345 6789"
                    className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-gray-700 font-medium"
                  >
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Your address (optional)"
                    className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Professional Information
                </h3>

                <div className="space-y-2">
                  <Label
                    htmlFor="instructorId"
                    className="text-gray-700 font-medium"
                  >
                    Instructor ID *
                  </Label>
                  <Input
                    id="instructorId"
                    placeholder="Enter your instructor ID"
                    className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
                    {...register("instructorId")}
                  />
                  {errors.instructorId && (
                    <p className="text-sm text-red-600">
                      {errors.instructorId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="text-gray-700 font-medium"
                  >
                    Department *
                  </Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDepartmentId(value);
                          setValue("program", "");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading departments...
                            </SelectItem>
                          ) : departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-departments" disabled>
                              No departments available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department && (
                    <p className="text-sm text-red-600">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="program"
                    className="text-gray-700 font-medium"
                  >
                    Program
                  </Label>
                  <Controller
                    name="program"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDepartmentId || coursesLoading}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
                          <SelectValue
                            placeholder={
                              !selectedDepartmentId
                                ? "Select department first"
                                : coursesLoading
                                ? "Loading programs..."
                                : "Select program (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {coursesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading programs...
                            </SelectItem>
                          ) : courses.length > 0 ? (
                            courses.map((course: any) => (
                              <SelectItem key={course.id} value={course.code}>
                                {course.code} - {course.name}
                              </SelectItem>
                            ))
                          ) : selectedDepartmentId ? (
                            <SelectItem value="no-programs" disabled>
                              No programs available for this department
                            </SelectItem>
                          ) : (
                            <SelectItem value="select-dept" disabled>
                              Select a department first
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.program && (
                    <p className="text-sm text-red-600">
                      {errors.program.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    rows={3}
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Security
                </h3>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="border-gray-300 focus:border-accent-500 focus:ring-accent-500 pr-10"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="border-gray-300 focus:border-accent-500 focus:ring-accent-500 pr-10"
                      {...register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
                disabled={isLoading || registerMutation.isPending}
              >
                {isLoading || registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login/instructor"
                  className="text-accent-600 hover:text-accent-700 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
              <Link
                href="/select-role"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
