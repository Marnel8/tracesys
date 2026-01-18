"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth, useLogout } from "@/hooks/auth/useAuth";
import { useToast } from "@/components/ui/use-toast";
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
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Layers,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    {}
  );

  // Create menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dashboard/admin",
    },
    {
      title: "Departments",
      icon: Building2,
      url: "/dashboard/admin/departments",
    },
    {
      title: "Courses",
      icon: BookOpen,
      url: "/dashboard/admin/courses",
    },
    {
      title: "Sections",
      icon: Layers,
      url: "/dashboard/admin/sections",
    },
    {
      title: "Users",
      icon: Users,
      url: "/dashboard/admin/users",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/dashboard/admin/settings",
    },
  ];

  // Function to check if a menu item is active
  const isMenuItemActive = (item: any): boolean => {
    if (item.url && pathname === item.url) return true;
    if (item.items) {
      return item.items.some((subItem: any) => pathname === subItem.url);
    }
    return false;
  };

  return (
    <Sidebar
      className="border-r border-primary-200 bg-white"
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-primary-200 bg-secondary-50/50 px-0">
        <div className="flex items-center gap-3 px-4 py-4 min-h-[64px]">
          <div className="flex-shrink-0">
            <Image
              src="/images/tracesys-logo.png"
              alt="TracèSys"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate">TracèSys</h2>
            <p className="text-xs text-gray-600 truncate">Admin Portal</p>
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
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="w-full"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 w-full min-w-0"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                        {pathname === item.url && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto flex-shrink-0" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user
                            ? `${user.firstName}${
                                user.middleName ? ` ${user.middleName}` : ""
                              } ${user.lastName}`
                            : "Loading user..."}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.role
                            ? user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
                            : ""}
                        </p>
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56 mb-2">
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => {
                      logout(undefined, {
                        onSuccess: () => {
                          toast({ title: "Signed out successfully" });
                          setTimeout(() => {
                            window.location.replace("/login/admin");
                          }, 200);
                        },
                        onError: (error: any) => {
                          console.error("Logout error:", error);
                          toast({
                            title: "Sign out failed",
                            description: error.message || "Please try again",
                            variant: "destructive",
                          });
                          setTimeout(() => {
                            window.location.replace("/login/admin");
                          }, 1000);
                        },
                      });
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

