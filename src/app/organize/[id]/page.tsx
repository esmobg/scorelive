import type { Metadata } from "next";
import { OrganizeManagePage } from "@/components/pages/organize-manage";

export const metadata: Metadata = {
  title: "Управление на турнир",
};

export default function OrganizeIdPage() {
  return <OrganizeManagePage />;
}
