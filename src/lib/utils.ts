import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to conditionally join class names together.
 * It's a combination of `clsx` and `tailwind-merge`.
 *
 * `clsx`: Allows you to construct class strings conditionally. For example:
 *   `clsx('foo', true && 'bar', false && 'baz')` returns `'foo bar'`.
 *
 * `tailwind-merge`: Intelligently merges Tailwind CSS classes, resolving conflicts. For example:
 *   `twMerge('p-2', 'p-4')` returns `'p-4'`.
 *   `twMerge('bg-red-500', 'bg-blue-500')` returns `'bg-blue-500'`.
 *
 * This `cn` function is a standard utility in projects using `shadcn/ui`.
 *
 * @param {...ClassValue[]} inputs - A list of class names, conditional objects, or arrays.
 * @returns {string} The final, merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
