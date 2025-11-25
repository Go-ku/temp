export function redirectByRole(role) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "landlord":
      return "/dashboard/landlord";
    case "manager":
      return "/dashboard/manager";
    case "maintenance":
      return "/dashboard/maintenance";
    default:
      return "/dashboard/tenant";
  }
}
