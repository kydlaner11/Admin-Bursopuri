"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/utils/auth";
import ProtectedRoute from "@/lib/ProtectedPage";

const MasterLayout = ({ children, requiredRoles = [] }) => {
  let pathname = usePathname();
  let [sidebarActive, setSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = usePathname();
  const { user, role, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Still try to redirect even if there's an error
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Role-based menu visibility functions
  const isMenuVisible = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // Show if no role restriction
    return allowedRoles.includes(role);
  };

  const isAdminOnly = () => role === 'admin';
  const isKepalaDapurOnly = () => role === 'kepala_dapur';
  // const isAdminOrKepalaDapur = () => ['admin', 'kepala_dapur'].includes(role);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px";
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`;
        }
      }
    };

    // Add a small delay to ensure DOM is ready after role-based rendering
    const timeoutId = setTimeout(() => {
      const dropdownTriggers = document.querySelectorAll(
        ".sidebar-menu .dropdown > a"
      );

      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick); // Remove existing listener
        trigger.addEventListener("click", handleDropdownClick);
      });

      const openActiveDropdown = () => {
        const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
        allDropdowns.forEach((dropdown) => {
          const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
          submenuLinks.forEach((link) => {
            if (
              link.getAttribute("href") === location ||
              link.getAttribute("to") === location
            ) {
              dropdown.classList.add("open");
              const submenu = dropdown.querySelector(".sidebar-submenu");
              if (submenu) {
                submenu.style.maxHeight = `${submenu.scrollHeight}px`;
              }
            }
          });
        });
      };

      openActiveDropdown();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const dropdownTriggers = document.querySelectorAll(
        ".sidebar-menu .dropdown > a"
      );
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location, role]); // Add role to dependency array

  let sidebarControl = () => {
    setSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Use email username part
    }
    return 'User';
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (!role) return 'Loading...';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

  return (
    <ProtectedRoute allowedRoles={requiredRoles}>
      <section className={mobileMenu ? "overlay active" : "overlay "}>
        {/* sidebar */}
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
            onClick={mobileMenuControl}
            type='button'
            className='sidebar-close-btn'
          >
            <Icon icon='radix-icons:cross-2' />
          </button>
          <div>
            <Link href='/' className='sidebar-logo'>
              <img
                src='assets/images/bursopuri.png'
                alt='site logo'
                className='light-logo'
              />
              <img
                src='assets/images/bursopuri.png'
                alt='site logo'
                className='dark-logo'
              />
              <img
                src='assets/images/logo-bursopuri.png'
                alt='site logo'
                className='logo-icon'
              />
            </Link>
          </div>
          <div className='sidebar-menu-area'>
            <ul className='sidebar-menu' id='sidebar-menu'>
              {/* Dashboard - Visible to all roles */}
              {isAdminOnly() && (
              <li>
                <Link
                  href='/'
                  className={pathname === "/" ? "active-page" : ""}
                >
                  <Icon icon="hugeicons:border-full" className='menu-icon' />
                  <span>Dashboard</span>
                </Link>
              </li>
              )}

              {isKepalaDapurOnly() && (
                <li>
                  <Link
                    href='/orders'
                    className={pathname === "/orders" ? "active-page" : ""}
                  >
                    <Icon icon="hugeicons:sending-order" className='menu-icon' />
                    <span>Pesanan</span>
                  </Link>
                </li>
              )}

              {/* Orders - Visible to Admin and Kepala Dapur */}
              {isMenuVisible(['admin', 'kepala_dapur']) && (
                 <li>
                  <Link
                    href='/order-history'
                    className={pathname === "/order-history" ? "active-page" : ""}
                  >
                    <Icon icon="hugeicons:brochure" className='menu-icon' />
                    <span>Riwayat Pesanan</span>
                  </Link>
                </li>
              )}

              {isAdminOnly() && (
                <li className='sidebar-menu-group-title'>Kelola</li>
              )}
              {/* Menu Management Dropdown - Different visibility based on role */}
              {isAdminOnly() && (
                <li className='dropdown'>
                  <Link href='#'>
                    <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                    <span>Kelola Menu</span>
                  </Link>
                  <ul className='sidebar-submenu'>
                    {/* Menu List - Visible to both Admin and Kepala Dapur */}
                    <li>
                      <Link
                        href='/menu-list'
                        className={
                          pathname === "/menu-list" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                        Menu
                      </Link>
                    </li>

                    {/* Menu Options - Admin only */}
                    {isAdminOnly() && (
                      <li>
                        <Link
                          href='/options-list'
                          className={
                            pathname === "/options-list" ? "active-page" : ""
                          }
                        >
                          <i className='ri-circle-fill circle-icon text-warning-main w-auto' />
                          Pilihan Menu
                        </Link>
                      </li>
                    )}

                    {/* Category - Admin only */}
                    {isAdminOnly() && (
                      <li>
                        <Link
                          href='/category-list'
                          className={
                            pathname === "/category-list" ? "active-page" : ""
                          }
                        >
                          <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
                          Kategori Menu
                        </Link>
                      </li>
                    )}

                    {/* Menu Stock - Visible to both Admin and Kepala Dapur */}
                    <li>
                      <Link
                        href='/menu-stock'
                        className={
                          pathname === "/menu-stock" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-warning-main w-auto' />
                        Stok Menu
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Media Management Dropdown - Admin only */}
              {isAdminOnly() && (
                <li className='dropdown'>
                  <Link href='#'>
                    <Icon icon='hugeicons:image-composition' className='menu-icon' />
                    <span>Kelola Media</span>
                  </Link>
                  <ul className='sidebar-submenu'>
                    <li>
                      <Link
                        href='/banner-list'
                        className={
                          pathname === "/banner-list" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                        Banner
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* User Management - Admin only */}
              {/* {isAdminOnly() && (
                <li className='dropdown'>
                  <Link href='#'>
                    <Icon icon='hugeicons:user-settings-01' className='menu-icon' />
                    <span>User Management</span>
                  </Link>
                  <ul className='sidebar-submenu'>
                    <li>
                      <Link
                        href='/users'
                        className={
                          pathname === "/users" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-info-main w-auto' />
                        All Users
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/user-roles'
                        className={
                          pathname === "/user-roles" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-danger-main w-auto' />
                        User Roles
                      </Link>
                    </li>
                  </ul>
                </li>
              )} */}

              {/* Kitchen-specific menu for Kepala Dapur */}
              {/* {isKepalaDapurOnly() && (
                <li className='dropdown'>
                  <Link href='#'>
                    <Icon icon='hugeicons:chef-hat' className='menu-icon' />
                    <span>Kitchen Management</span>
                  </Link>
                  <ul className='sidebar-submenu'>
                    <li>
                      <Link
                        href='/kitchen-orders'
                        className={
                          pathname === "/kitchen-orders" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />
                        Kitchen Orders
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/preparation-status'
                        className={
                          pathname === "/preparation-status" ? "active-page" : ""
                        }
                      >
                        <i className='ri-circle-fill circle-icon text-warning-main w-auto' />
                        Preparation Status
                      </Link>
                    </li>
                  </ul>
                </li>
              )} */}
            </ul>
          </div>
        </aside>

        <main
          className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
        >
          <div className='navbar-header'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <div className='d-flex flex-wrap align-items-center gap-4'>
                  <button
                    type='button'
                    className='sidebar-toggle'
                    onClick={sidebarControl}
                  >
                    {sidebarActive ? (
                      <Icon
                        icon='iconoir:arrow-right'
                        className='icon text-2xl non-active'
                      />
                    ) : (
                      <Icon
                        icon='heroicons:bars-3-solid'
                        className='icon text-2xl non-active '
                      />
                    )}
                  </button>
                  <button
                    onClick={mobileMenuControl}
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
                        src='assets/images/users.png'
                        alt='User Avatar'
                        className='w-40-px h-40-px object-fit-cover rounded-circle'
                      />
                    </button>
                    <div className='dropdown-menu to-top dropdown-menu-sm'>
                      <div className='py-12 px-16 radius-8 mb-16 d-flex align-items-center justify-content-between gap-2' style={{ backgroundColor: '#f8f9fa' }}>
                        <div>
                          <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                            {getUserDisplayName()}
                          </h6>
                          <span className='text-secondary-light fw-medium text-sm'>
                            {getRoleDisplayName()}
                          </span>
                        </div>
                        <button type='button' className='hover-text-danger'>
                          <Icon
                            icon='radix-icons:cross-1'
                            className='icon text-xl'
                          />
                        </button>
                      </div>
                      <ul className='to-top-list'>
                        <li>
                          <button
                            onClick={handleSignOut}
                            disabled={loading}
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 border-0 bg-transparent w-100 text-start'
                          >
                            <Icon icon='lucide:power' className='icon text-xl' />{" "}
                            {loading ? 'Signing Out...' : 'Sign Out'}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* dashboard-main-body */}
          <div className='dashboard-main-body'>{children}</div>

          {/* Footer section */}
          <footer className='d-footer'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <p className='mb-0'>© 2025 Bursopuri. All Rights Reserved.</p>
              </div>
              <div className='col-auto'>
                <p className='mb-0'>
                  Made by <span className='text-600' style={{ color: '#7C0000' }}>Mickael Renaldy</span>
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