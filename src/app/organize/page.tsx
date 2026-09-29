import type { Metadata } from "next";
import { OrganizeCreatePage } from "@/components/pages/organize-create";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Организирай",
};

export default function OrganizePage() {
  return <OrganizeCreatePage />;
}
