"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Bell,
  HelpCircle,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard/instructor",
  },
  {
    title: "Student Management",
    icon: Users,
    items: [
      {
        title: "All Students",
        url: "/dashboard/instructor/students",
        badge: "42",
      },
      {
        title: "Add Student",
        url: "/dashboard/instructor/students/add",
      },
      {
        title: "Sections",
        url: "/dashboard/instructor/sections",
      },
    ],
  },
  {
    title: "Attendance",
    icon: Clock,
    items: [
      {
        title: "Review Attendance",
        url: "/dashboard/instructor/attendance",
        badge: "12",
      },
      {
        title: "Attendance History",
        url: "/dashboard/instructor/attendance/history",
      },
      {
        title: "Reports",
        url: "/dashboard/instructor/attendance/reports",
      },
    ],
  },
  {
    title: "Requirements",
    icon: FileText,
    items: [
      {
        title: "Pending Review",
        url: "/dashboard/instructor/requirements",
        badge: "8",
      },
      {
        title: "All Submissions",
        url: "/dashboard/instructor/requirements/all",
      },
      {
        title: "Manage Templates",
        url: "/dashboard/instructor/requirements/templates",
      },
    ],
  },
  {
    title: "Reports",
    icon: ClipboardList,
    items: [
      {
        title: "Weekly Reports",
        url: "/dashboard/instructor/reports/weekly",
        badge: "5",
      },
      {
        title: "Narrative Reports",
        url: "/dashboard/instructor/reports/narrative",
      },
      {
        title: "Report Templates",
        url: "/dashboard/instructor/reports/templates",
      },
    ],
  },
  {
    title: "Announcements",
    icon: MessageSquare,
    url: "/dashboard/instructor/announcements",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/dashboard/instructor/analytics",
  },
]

export function InstructorSidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  // Function to check if a menu item or its children are active
  const isMenuItemActive = (item: any): boolean => {
    if (item.url && pathname === item.url) return true
    if (item.items) {
      return item.items.some((subItem: any) => pathname === subItem.url)
    }
    return false
  }

  // Function to check if any child item is active
  const hasActiveChild = (items: any[]): boolean => {
    return items.some((item) => pathname === item.url)
  }

  // Auto-expand sections that contain the current page
  useEffect(() => {
    const newOpenSections: Record<string, boolean> = {}

    menuItems.forEach((item) => {
      if (item.items && hasActiveChild(item.items)) {
        newOpenSections[item.title] = true
      }
    })

    setOpenSections(newOpenSections)
  }, [pathname])

  const handleSectionToggle = (sectionTitle: string, isOpen: boolean) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: isOpen,
    }))
  }

  return (
    <Sidebar className="border-r border-primary-200 bg-white" collapsible="offcanvas">
      <SidebarHeader className="border-b border-primary-200 bg-secondary-50/50 px-0">
        <div className="flex items-center gap-3 px-4 py-4 min-h-[64px]">
          <div className="flex-shrink-0">
            <Image src="/images/tracesys-logo.png" alt="TracèSys" width={32} height={32} className="object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate">TracèSys</h2>
            <p className="text-xs text-gray-600 truncate">Instructor Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white px-0 sidebar-content sidebar-scrollarea">
        <div className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <Collapsible
                        open={openSections[item.title] || false}
                        onOpenChange={(isOpen) => handleSectionToggle(item.title, isOpen)}
                        className="group/collapsible"
                      >
                        <SidebarMenuButton
                          asChild
                          className={`w-full ${isMenuItemActive(item) ? "bg-primary-50 text-primary-700 font-medium" : ""}`}
                        >
                          <CollapsibleTrigger className="w-full [&[data-state=open]>svg:last-child]:rotate-180">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                            {hasActiveChild(item.items) && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full ml-1 flex-shrink-0" />
                            )}
                            <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <SidebarMenuSub className="ml-4 border-l border-primary-200 px-2.5 py-0.5">
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url} className="w-full">
                                  <Link href={subItem.url} className="flex items-center justify-between w-full min-w-0">
                                    <span className="flex items-center gap-2 min-w-0 flex-1">
                                      <span className="truncate">{subItem.title}</span>
                                      {pathname === subItem.url && (
                                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full ml-1 flex-shrink-0" />
                                      )}
                                    </span>
                                    {subItem.badge && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary-100 text-primary-700 text-xs ml-2 flex-shrink-0"
                                      >
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild isActive={pathname === item.url} className="w-full">
                        <Link href={item.url} className="flex items-center gap-2 w-full min-w-0">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                          {pathname === item.url && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto flex-shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-4" />

          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/instructor/settings"}>
                    <Link href="/dashboard/instructor/settings" className="flex items-center gap-2 w-full">
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Settings</span>
                      {pathname === "/dashboard/instructor/settings" && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  {/* <SidebarMenuButton asChild isActive={pathname === "/help"}>
                    <Link href="/help" className="flex items-center gap-2 w-full">
                      <HelpCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Help & Support</span>
                      {pathname === "/help" && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  </SidebarMenuButton> */}
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/instructor/audit"}>
                    <Link href="/dashboard/instructor/audit" className="flex items-center gap-2 w-full">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Audit Trail</span>
                      {pathname === "/dashboard/instructor/audit" && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary-200 bg-secondary-50/50 px-0">
        <div className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full h-auto p-3 hover:bg-primary-50">
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Prof. Juan Dela Cruz</p>
                        <p className="text-xs text-gray-600 truncate">Instructor</p>
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56 mb-2">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
