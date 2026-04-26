import React from "react";
import { Link } from "react-router-dom";
// Helper components
export const MenuItem = ({ to, href, icon: Icon, children, badge, onClick }) => {
  const className = `flex items-center px-3 py-2.5 mb-1 rounded-lg transition ${
    !href && location.pathname === to ? "bg-base-300" : "hover:bg-base-200"
  }`;

  const content = (
    <>
      <Icon size={22} /> {children}
      {badge && (
        <div className="badge badge-sm badge-secondary ml-auto">{badge}</div>
      )}
    </>
  );

  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
          {content}
        </a>
      ) : (
        <Link to={to} className={className} onClick={onClick}>
          {content}
        </Link>
      )}
    </li>
  );
};
