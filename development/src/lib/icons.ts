import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export function getIconByName(name: string): LucideIcon {
  // @ts-ignore
  const Icon = Icons[name];
  return Icon || Icons.Code;
}
