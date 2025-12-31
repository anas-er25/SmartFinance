import { 
  Coffee, ShoppingBag, Car, Utensils, Home, Zap, Activity, 
  Gamepad2, Smartphone, Landmark, Tag, Repeat, Plane, 
  Briefcase, GraduationCap, Heart, Music, Wifi, Gift
} from 'lucide-react';

// Define available icon keys
export const AVAILABLE_ICONS = {
  'tag': Tag,
  'food': Utensils,
  'coffee': Coffee,
  'shopping': ShoppingBag,
  'car': Car,
  'home': Home,
  'utilities': Zap,
  'health': Activity,
  'entertainment': Gamepad2,
  'tech': Smartphone,
  'bank': Landmark,
  'travel': Plane,
  'work': Briefcase,
  'education': GraduationCap,
  'love': Heart,
  'music': Music,
  'internet': Wifi,
  'gift': Gift
};

export type IconKey = keyof typeof AVAILABLE_ICONS;

export const getIconByKey = (key: string) => {
  return AVAILABLE_ICONS[key as IconKey] || Tag;
};