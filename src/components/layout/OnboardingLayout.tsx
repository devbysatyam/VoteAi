import { Outlet } from 'react-router-dom';

export default function OnboardingLayout() {
  return (
    <main id="main-content" role="main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </main>
  );
}
