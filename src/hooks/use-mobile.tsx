import * as React from "react"

// Define the breakpoint for what is considered a "mobile" screen width.
const MOBILE_BREAKPOINT = 768

/**
 * A custom React hook to determine if the current viewport width is "mobile".
 *
 * How it works:
 * 1. It uses `window.matchMedia` to create a media query for screen widths less than `MOBILE_BREAKPOINT`.
 * 2. `useState` holds the boolean result (`isMobile`). It's initially `undefined` to handle server-side rendering.
 * 3. `useEffect` runs on the client-side:
 *    - It sets the initial `isMobile` state based on the current window width.
 *    - It adds a 'change' event listener to the media query. This listener updates the `isMobile` state whenever the viewport crosses the breakpoint.
 *    - The cleanup function removes the event listener when the component unmounts to prevent memory leaks.
 *
 * @returns {boolean} `true` if the viewport width is less than the mobile breakpoint, otherwise `false`.
 *                    Returns `false` during server-side rendering.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // The handler that updates the state when the media query match changes.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add the listener.
    mql.addEventListener("change", onChange)
    
    // Set the initial state when the component mounts on the client.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Cleanup function to remove the listener on unmount.
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array means this effect runs only once on mount.

  // Return `false` on the server (where `isMobile` is undefined) and the actual value on the client.
  return !!isMobile
}
