import MapHomePage from './MapHomePage';

/**
 * Home page - Always shows the interactive map for ALL users (guests and authenticated)
 * 
 * UX Philosophy: The map IS the app, not a feature you navigate to.
 * - Guests can browse, search, and view job listings freely
 * - Authentication is only required for ACTIONS (apply, post, message)
 * - Landing/marketing page moved to /welcome route
 */
export default function Home() {
  return <MapHomePage />;
}
