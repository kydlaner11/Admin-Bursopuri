import { getCookie } from "./cookies";

export const isAuthenticated = () => {
  // Use cookies to check authentication
  return !!getCookie("authToken");
};

export const withAuth = (Component) => {
  return (props) => {
    if (!isAuthenticated()) {
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in"; // Redirect to sign-in page
      }
      return null;
    }
    return <Component {...props} />;
  };
};
