"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePathname } from "next/navigation";
import Link from "next/link";

const MasterLayout = ({ children }) => {
  let pathname = usePathname();
  let [sidebarActive, setSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = usePathname(); // Hook to get the current route

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
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
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
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    setSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
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
          {/* <li>
              <Link
                href='/dashboard'
                className={pathname === "/dashboard" ? "active-page" : ""}
              >
                <Icon icon='solar:home-smile-angle-outline' className='menu-icon' />
                <span>Dashboard</span>
              </Link>
            </li> */}
            <li>
              <Link
                href='/'
                className={pathname === "/" ? "active-page" : ""}
              >
                <Icon icon="hugeicons:border-full" className='menu-icon' />
                <span>Order</span>
              </Link>
            </li>
            <li>
              <Link
                href='/order-history'
                className={pathname === "/order-history" ? "active-page" : ""}
              >
                <Icon icon="hugeicons:brochure" className='menu-icon' />
                <span>Riwayat Order</span>
              </Link>
            </li>

            <li className='sidebar-menu-group-title'>Menu</li>


            {/* Invoice Dropdown */}
            <li className='dropdown'>
              <Link href='#'>
                <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                <span>Atur Menu</span>
              </Link>
              <ul className='sidebar-submenu'>
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
                {/* <li>
                  <Link
                    href='/menu-add'
                    className={pathname === "/menu-add" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Add New Menu
                  </Link>
                </li>
                <li>
                  <Link
                    href='/menu-edit'
                    className={
                      pathname === "/menu-edit" ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Edit Menu
                  </Link>
                </li> */}
              </ul>
            </li>



            <li className='sidebar-menu-group-title'>Application</li>

            {/* Authentication Dropdown */}
            <li className='dropdown'>
              <Link href='#'>
                <Icon icon='simple-line-icons:vector' className='menu-icon' />
                <span>Authentication</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <Link
                    href='/sign-in'
                    className={pathname === "/sign-in" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href='/sign-up'
                    className={pathname === "/sign-up" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href='/forgot-password'
                    className={
                      pathname === "/forgot-password" ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Forgot Password
                  </Link>
                </li>
              </ul>
            </li>

            {/* Blog */}

            {/* Settings Dropdown */}
            <li className='dropdown'>
              <Link href='#'>
                <Icon
                  icon='icon-park-outline:setting-two'
                  className='menu-icon'
                />
                <span>Settings</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <Link
                    href='/company'
                    className={pathname === "/company" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Company
                  </Link>
                </li>
                <li>
                  <Link
                    href='/notification'
                    className={
                      pathname === "/notification" ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Notification
                  </Link>
                </li>
                <li>
                  <Link
                    href='/notification-alert'
                    className={
                      pathname === "/notification-alert" ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Notification Alert
                  </Link>
                </li>
                <li>
                  <Link
                    href='/theme'
                    className={pathname === "/theme" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Theme
                  </Link>
                </li>
                <li>
                  <Link
                    href='/currencies'
                    className={pathname === "/currencies" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Currencies
                  </Link>
                </li>
                <li>
                  <Link
                    href='/language'
                    className={pathname === "/language" ? "active-page" : ""}
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Languages
                  </Link>
                </li>
                <li>
                  <Link
                    href='/payment-gateway'
                    className={
                      pathname === "/payment-gateway" ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Payment Gateway
                  </Link>
                </li>
              </ul>
            </li>
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
                {/* <form className='navbar-search'>
                  <input type='text' name='search' placeholder='Search' />
                  <Icon icon='ion:search-outline' className='icon' />
                </form> */}
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* <ThemeToggleButton /> */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='assets/images/user.png'
                      alt='image_user'
                      className='w-40-px h-40-px object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          Shaidul Islam
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          Admin
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
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          href='/view-profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Profile
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          href='/email'
                        >
                          <Icon
                            icon='tabler:message-check'
                            className='icon text-xl'
                          />{" "}
                          Inbox
                        </Link>
                      </li> */}
                        {/* <li>
                          <Link
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                            href='/company'
                          >
                            <Icon
                              icon='icon-park-outline:setting-two'
                              className='icon text-xl'
                            />
                            Setting
                          </Link>
                        </li> */}
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                          href='#'
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
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
                Made by <span className='text-primary-600'>Mickael Renaldy</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
