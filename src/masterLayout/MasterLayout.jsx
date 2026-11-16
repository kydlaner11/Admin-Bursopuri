"use client";
// src/masterLayout/MasterLayout.jsx
import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/utils/auth";
import ProtectedRoute from "@/lib/ProtectedPage";
import SidebarMenu from "./SidebarMenu";
import { getRolesForPath } from "@/config/navigation";

const MasterLayout = ({ children, requiredRoles }) => {
  const pathname = usePathname();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user, role, signOut, loading } = useAuth();

  // Kalau page tidak mengirim requiredRoles, ambil otomatis dari config menu.
  const allowedRoles =
    requiredRoles && requiredRoles.length > 0
      ? requiredRoles
      : getRolesForPath(pathname);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) console.error("Error signing out:", error);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserDisplayName = () =>
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const getRoleDisplayName = () => {
    if (!role) return "Loading...";
    const text = role.replaceAll("_", " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <section className={mobileMenu ? "overlay active" : "overlay "}>
        <aside
          className={
            sidebarActive
              ? "sidebar active "
              : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
          }
        >
          <button
            onClick={() => setMobileMenu((v) => !v)}
            type='button'
            className='sidebar-close-btn'
          >
            <Icon icon='radix-icons:cross-2' />
          </button>

          <div>
            <Link href='/' className='sidebar-logo'>
              <img src='/assets/images/bursopuri.png' alt='site logo' className='light-logo' />
              <img src='/assets/images/bursopuri.png' alt='site logo' className='dark-logo' />
              <img src='/assets/images/logo-bursopuri.png' alt='site logo' className='logo-icon' />
            </Link>
          </div>

          <div className='sidebar-menu-area'>
            <SidebarMenu role={role} />
          </div>
        </aside>

        <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
          <div className='navbar-header'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <div className='d-flex flex-wrap align-items-center gap-4'>
                  <button
                    type='button'
                    className='sidebar-toggle'
                    onClick={() => setSidebarActive((v) => !v)}
                  >
                    <Icon
                      icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"}
                      className='icon text-2xl non-active'
                    />
                  </button>
                  <button
                    onClick={() => setMobileMenu((v) => !v)}
                    type='button'
                    className='sidebar-mobile-toggle'
                  >
                    <Icon icon='heroicons:bars-3-solid' className='icon' />
                  </button>
                </div>
              </div>

              <div className='col-auto'>
                <div className='d-flex flex-wrap align-items-center gap-3'>
                  <div className='dropdown'>
                    <button
                      className='d-flex justify-content-center align-items-center rounded-circle'
                      type='button'
                      data-bs-toggle='dropdown'
                      disabled={loading}
                    >
                      <img
                        src='/assets/images/users.png'
                        alt='User Avatar'
                        className='w-40-px h-40-px object-fit-cover rounded-circle'
                      />
                    </button>
                    <div className='dropdown-menu to-top dropdown-menu-sm'>
                      <div
                        className='py-12 px-16 radius-8 mb-16 d-flex align-items-center justify-content-between gap-2'
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <div>
                          <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                            {getUserDisplayName()}
                          </h6>
                          <span className='text-secondary-light fw-medium text-sm'>
                            {getRoleDisplayName()}
                          </span>
                        </div>
                      </div>
                      <ul className='to-top-list'>
                        <li>
                          <button
                            onClick={handleSignOut}
                            disabled={loading}
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 border-0 bg-transparent w-100 text-start'
                          >
                            <Icon icon='lucide:power' className='icon text-xl' />{" "}
                            {loading ? "Signing Out..." : "Sign Out"}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='dashboard-main-body'>{children}</div>

          <footer className='d-footer'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <p className='mb-0'>© 2025 Bursopuri. All Rights Reserved.</p>
              </div>
              <div className='col-auto'>
                <p className='mb-0'>
                  Made by{" "}
                  <span className='text-600' style={{ color: "#7C0000" }}>
                    Mickael Renaldy
                  </span>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </section>
    </ProtectedRoute>
  );
};

export default MasterLayout;