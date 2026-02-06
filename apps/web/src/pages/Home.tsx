import MapHomePage from './MapHomePage';

/**
 * Home page routing logic:
 * - Show map for ALL users (authenticated AND guests)
 * - Guests can browse map and see jobs, but need to login to apply/post
 * - This is the "second world" - the interactive map experience
 * - Landing page (/welcome) is the gateway that explains what this is
 */
export default function Home() {
  // Always show map - both authenticated users and guests can browse
  return <MapHomePage />;
}
