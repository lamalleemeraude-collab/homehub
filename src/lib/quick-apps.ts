import {
  Backpack,
  Bus,
  GraduationCap,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { PASTEL_ICON, type PastelAccent } from "@/lib/ui/pastel-theme";

export type QuickApp = {
  id: string;
  label: string;
  sub?: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
  accent: PastelAccent;
  iconGradient: string;
};

/** Collège — ordre : Sac, Bus, École, Menu */
export const COLLEGE_APPS: QuickApp[] = [
  {
    id: "sac",
    label: "Sac",
    href: "/routine/sac",
    icon: Backpack,
    accent: "bag",
    iconGradient: PASTEL_ICON.bag,
  },
  {
    id: "bus",
    label: "Bus",
    sub: "DI10",
    href: "/docs-utiles",
    icon: Bus,
    accent: "bus",
    iconGradient: PASTEL_ICON.bus,
  },
  {
    id: "ecoledirecte",
    label: "École",
    href: "https://www.ecoledirecte.com/login?cameFrom=%2F1%2F3092%2FMessagerie",
    external: true,
    icon: GraduationCap,
    accent: "school",
    iconGradient: PASTEL_ICON.school,
  },
  {
    id: "cantine",
    label: "Menu",
    href: "https://www.clicetmiam.fr/connexion",
    external: true,
    icon: UtensilsCrossed,
    accent: "canteen",
    iconGradient: PASTEL_ICON.canteen,
  },
];

/** @deprecated alias — préférer COLLEGE_APPS */
export const QUICK_APPS = COLLEGE_APPS;
