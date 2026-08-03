import {
  DollarSign,
  Wallet,
  CreditCard,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Briefcase,
} from 'lucide-react';

// Shared mapping from category name to icon component
const CATEGORY_ICON_MAP = {
  Food: Utensils,
  Housing: Home,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Smartphone,
  Healthcare: Heart,
  Utilities: CreditCard,
  Insurance: Briefcase,
  Rent: Home,
  Salary: DollarSign,
  Freelance: Briefcase,
};

export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Wallet;
  return CATEGORY_ICON_MAP[categoryName] || Wallet;
};

export default getCategoryIcon;

