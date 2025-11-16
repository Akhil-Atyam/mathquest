import { BrainCircuit } from 'lucide-react';

/**
 * A simple, reusable component that displays the application's logo.
 * It consists of an icon and the application name.
 */
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold font-headline">MathQuest</span>
    </div>
  );
}
