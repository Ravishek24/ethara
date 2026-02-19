import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>HRMS Lite</div>
      <div style={styles.links}>
        <Link
          to="/"
          style={location.pathname === '/' ? styles.activeLink : styles.link}
        >
          Employees
        </Link>
        <Link
          to="/attendance"
          style={
            location.pathname === '/attendance' ? styles.activeLink : styles.link
          }
        >
          Attendance
        </Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#1a1a2e',
    color: 'white',
  },
  brand: { fontSize: '20px', fontWeight: 'bold', color: '#e94560' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#ccc', textDecoration: 'none' },
  activeLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderBottom: '2px solid #e94560',
    paddingBottom: '4px',
  },
}

