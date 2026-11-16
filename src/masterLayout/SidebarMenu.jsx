"use client";
// src/masterLayout/SidebarMenu.jsx
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { NAV_ITEMS, filterNavByRole } from "@/config/navigation";

const Dropdown = ({ item, pathname, open, onToggle }) => {
  const [height, setHeight] = useState(0);
  const refCb = (el) => {
    if (el) setHeight(el.scrollHeight);
  };

  return (
    <li className={`dropdown ${open ? "open" : ""}`}>
      <a
        href='#'
        onClick={(e) => {
          e.preventDefault();
          onToggle(item.id);
        }}
      >
        <Icon icon={item.icon} className='menu-icon' />
        <span>{item.label}</span>
      </a>
      <ul
        ref={refCb}
        className='sidebar-submenu'
        style={{ maxHeight: open ? `${height}px` : "0px" }}
      >
        {item.children.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className={pathname === child.href ? "active-page" : ""}
            >
              <i className={`ri-circle-fill circle-icon ${child.dot ?? ""} w-auto`} />{" "}
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

const SidebarMenu = ({ role }) => {
  const pathname = usePathname();
  const items = useMemo(() => filterNavByRole(NAV_ITEMS, role), [role]);

  // dropdown yang berisi halaman aktif terbuka otomatis
  const activeParentId = items.find((i) =>
    i.children?.some((c) => c.href === pathname)
  )?.id;
  const [openId, setOpenId] = useState(activeParentId ?? null);
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <ul className='sidebar-menu' id='sidebar-menu'>
      {items.map((item) => {
        if (item.type === "group-title") {
          return (
            <li key={item.id} className='sidebar-menu-group-title'>
              {item.label}
            </li>
          );
        }
        if (item.children) {
          return (
            <Dropdown
              key={item.id}
              item={item}
              pathname={pathname}
              open={openId === item.id}
              onToggle={toggle}
            />
          );
        }
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={pathname === item.href ? "active-page" : ""}
            >
              <Icon icon={item.icon} className='menu-icon' />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarMenu;