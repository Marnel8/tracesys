"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  Users, 
  FileText, 
  BarChart3, 
  Clock,
  Star,
  ChevronRight,
  ExternalLink
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/select-role")
  }

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Management",
      description: "Organize and track all practicum documents in one place"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Monitoring",
      description: "Real-time tracking of student progress and achievements"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Tracking",
      description: "Accurate recording of training hours and attendance"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Assessment Tools",
      description: "Comprehensive evaluation and grading system"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full bg-hero-landing bg-cover bg-center bg-no-repeat" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/80 via-secondary-500/70 to-accent-500/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logos */}
          <div className="flex justify-center items-center gap-8 mb-8 animate-fade-in">
            <Image 
              src="/images/omsc-logo.png" 
              alt="OMSC Logo" 
              width={100} 
              height={100} 
              className="object-contain drop-shadow-2xl" 
            />
            <Image
              src="/images/tracesys-logo.png"
              alt="TracèSys Logo"
              width={100}
              height={100}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl animate-fade-in">
            Tracè<span className="text-primary-200">Sys</span>
          </h1>
          
          <h2 className="text-xl md:text-2xl font-semibold text-white/95 mb-6 drop-shadow-xl animate-fade-in">
            Performance Monitoring & File Management System
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-xl animate-fade-in">
            Streamline your On-The-Job Training (Practicum) experience with our comprehensive 
            digital platform designed for OMSC Mamburao Campus
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="bg-white/25 backdrop-blur-md border-white/40 text-white hover:bg-white/35 font-medium px-8 py-3 text-lg shadow-2xl"
              asChild
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-secondary-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Everything you need for successful practicum management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for both students and instructors 
              to ensure a smooth and productive training experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're a student trainee or an instructor, we have the right tools for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-secondary-50 to-primary-50 border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-8 h-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Student Trainees
                </h3>
                <p className="text-gray-600 mb-6">
                  Access your practicum records, submit reports, track your progress, 
                  and communicate with your supervisors all in one place.
                </p>
                <Button
                  onClick={() => router.push("/login/student")}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  Student Login
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent-50 to-secondary-50 border-accent-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Instructors & Advisers
                </h3>
                <p className="text-gray-600 mb-6">
                  Manage your students, create assignments, monitor progress, 
                  and generate comprehensive reports with ease.
                </p>
                <Button
                  onClick={() => router.push("/login/instructor")}
                  className="bg-accent-500 hover:bg-accent-600 text-white"
                >
                  Instructor Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center items-center gap-6 mb-6">
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
            <h3 className="text-xl font-bold mb-2">
              Occidental Mindoro State College
            </h3>
            <p className="text-gray-400 mb-4">
              Mamburao Campus - Practicum Management System
            </p>
            <p className="text-sm text-gray-500">
              © 2025 TracèSys. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
